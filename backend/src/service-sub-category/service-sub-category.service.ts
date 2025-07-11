import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSubCategoryDto } from './dto/createServiceSubCategory';
import { UpdateSubCategoryDto } from './dto/updateServiceSubCategory';


@Injectable()
export class ServiceSubCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  // ✅ Create a new subcategory and ensure category exists
  async createSubCategory(createSubCategoryDto: CreateSubCategoryDto) {
    const { serviceSubCatId, subCategoryName, serviceCategoryId } = createSubCategoryDto;

    // Check if category exists before proceeding
    const categoryExists = await this.prisma.serviceCategory.findUnique({
      where: { id: serviceCategoryId },
    });

    if (!categoryExists) {
      throw new NotFoundException(`Category with ID ${serviceCategoryId} not found.`);
    }

    return this.prisma.serviceSubCategory.create({
      data: {
        serviceSubCatId: createSubCategoryDto.serviceSubCatId,
        subCategoryName,
        category: {
          connect: { id: serviceCategoryId },
        },
      },
      include: {
        category: true,
      },
    });
  }

  // ✅ Fetch all subcategories with category names
  async getSubCategories() {
    return this.prisma.serviceSubCategory.findMany({
      include: {
        category: true, // Include associated category
      },
    });
  }

  // ✅ Fetch a specific subcategory by its ID
  async getSubCategoryById(id: number) {
    const subCategory = await this.prisma.serviceSubCategory.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!subCategory) {
      throw new NotFoundException(`SubCategory with ID ${id} not found.`);
    }

    return subCategory;
  }

  async updateSubCategory(id: number, updateSubCategoryDto: UpdateSubCategoryDto) {
    const { serviceSubCatId, subCategoryName, serviceCategoryId } = updateSubCategoryDto;
  
    if (serviceCategoryId) {
      const categoryExists = await this.prisma.serviceCategory.findUnique({
        where: { id: serviceCategoryId },
      });
  
      if (!categoryExists) {
        throw new NotFoundException(`Category with ID ${serviceCategoryId} not found.`);
      }
    }
  
    return this.prisma.serviceSubCategory.update({
      where: { id },
      data: {
        subCategoryName,
        category: serviceCategoryId ? { connect: { id: serviceCategoryId } } : undefined,
      },
      include: {
        category: true,
      },
    });
  }
  
  // ✅ Fetch subcategories by category ID
  async getSubCategoriesByCategoryId(serviceCategoryId: number) {
    // Check if category exists
    const categoryExists = await this.prisma.serviceCategory.findUnique({
      where: { id: serviceCategoryId},
    });

    if (!categoryExists) {
      throw new NotFoundException(`Category with ID ${serviceCategoryId} not found.`);
    }

    const subcategories = await this.prisma.serviceSubCategory.findMany({
      where: { serviceCategoryId },
      include: {
        category: true,
      },
    });

    if (subcategories.length === 0) {
      throw new NotFoundException(`No subcategories found for category ID ${serviceCategoryId}`);
    }

    return subcategories;
  }

  // ✅ Delete a subcategory by its ID
  async deleteSubCategory(id: number) {
    try {
      const subCategory = await this.prisma.serviceSubCategory.findUnique({
        where: { id },
      });

      if (!subCategory) {
        throw new NotFoundException(`SubCategory with ID ${id} not found.`);
      }

      return await this.prisma.serviceSubCategory.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`SubCategory with ID ${id} not found.`);
      }
      throw new InternalServerErrorException('Failed to delete subcategory');
    }
  }
}
