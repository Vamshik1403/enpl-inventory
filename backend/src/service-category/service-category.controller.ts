import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CreateCategoryDto } from './dto/createServiceCategory';
import { UpdateCategoryDto } from './dto/updateServiceCategory';
import { ServiceCategoryService } from './service-category.service';

@Controller('servicecategory')
export class ServiceCategoryController {
     constructor(private readonly categoryService: ServiceCategoryService) {}
    
      @Post()
      create(@Body() createCategoryDto: CreateCategoryDto) {
        return this.categoryService.createCategory(createCategoryDto);
      }
    
      @Get()
      findAll() {
        return this.categoryService.getCategories();
      }
    
      @Get(':id')
      findOne(@Param('id') id: string) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
          throw new BadRequestException('Invalid ID');
        }
        return this.categoryService.getCategoryById(numericId);
      }
    
      @Put(':id')
      async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
          throw new BadRequestException('Invalid ID');
        }
        return this.categoryService.updateCategory(numericId, updateCategoryDto);
      }
    
      @Delete(':id')
      remove(@Param('id') id: string) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
          throw new BadRequestException('Invalid ID');
        }
        return this.categoryService.deleteCategory(numericId);
      }
    
}
