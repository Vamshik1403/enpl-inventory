import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/createServiceCategory';
import { UpdateCategoryDto } from './dto/updateServiceCategory';


@Injectable()
export class ServiceCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  
  async createCategory(createCategoryDto: CreateCategoryDto) {
    const {  serviceCatId, categoryName, subCategories } = createCategoryDto;
  
    return this.prisma.serviceCategory.create({
      data: {
        serviceCatId,
        categoryName,
        subCategories: {
          create: subCategories, // Create subcategories based on the provided data
        },
      },
      include: {
        subCategories: true, // Return the subcategories with the created category
      },
    });
  }
  
  
  
  async getCategories() {
    return this.prisma.serviceCategory.findMany({
      include: {
        subCategories: true,
      },
    });
  }

  
  async getCategoryById(id: number) {
    const category = await this.prisma.serviceCategory.findUnique({
      where: { id },
      include: {
        subCategories: true,
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  
  async updateCategory(id: number, updateCategoryDto: UpdateCategoryDto) {
    const { serviceCatId, categoryName, subCategories } = updateCategoryDto;
  
    return this.prisma.serviceCategory.update({
      where: { id },
      data: {
        serviceCatId,
        categoryName,
        subCategories: {
          deleteMany: {}, // Remove all existing subcategories
          create: subCategories, // Add new subcategories
        },
      },
      include: {
        subCategories: true, // Include updated subcategories
      },
    });
  }
  
  
  async deleteCategory(id: number) {
    try {
      
      await this.prisma.subCategory.deleteMany({
        where: { categoryId: id },
      });
  
      
      return await this.prisma.serviceCategory.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Category with ID ${id} not found`);
      }
      throw new InternalServerErrorException('Failed to delete category');
    }
  }
  
}
