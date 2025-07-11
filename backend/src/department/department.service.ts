import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; 
import { CreateDepartmentDto } from './dto/create-dpt.dto';
import { UpdateDepartmentDto } from './dto/update-dpt.dto';

@Injectable()
export class DepartmentService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new department
  async create(createDepartmentDto: CreateDepartmentDto) {
    const { departmentName } = createDepartmentDto;

    const department = await this.prisma.department.create({
      data: {
        departmentName,
      },
    });

    return department;
  }

  // Get all departments
  async findAll() {
    return this.prisma.department.findMany();
  }

  // Get a department by ID
  async findOne(id: number) {
    const department = await this.prisma.department.findUnique({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return department;
  }

  // Update a department by ID
  async update(id: number, updateDepartmentDto: UpdateDepartmentDto) {
    const { departmentName } = updateDepartmentDto;

    // Ensure the department exists before updating
    const department = await this.prisma.department.findUnique({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return this.prisma.department.update({
      where: { id },
      data: { departmentName },
    });
  }

  // Delete a department by ID
  async remove(id: number) {
    const department = await this.prisma.department.findUnique({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return this.prisma.department.delete({
      where: { id },
    });
  }
}
