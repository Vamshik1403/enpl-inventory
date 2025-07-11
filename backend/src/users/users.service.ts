import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(createUserDto: CreateUserDto) {
    const { password, departmentIds, ...rest } = createUserDto;
  
    const hashedPassword = await bcrypt.hash(password, 10);
  
    return this.prisma.users.create({
      data: {
        ...rest,
        password: hashedPassword,
        departments: {
          connect: departmentIds.map((id) => ({ id })), 
        },
      },
    });
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    const { password, departmentIds = [], ...rest } = updateUserDto; // Ensure departmentIds is always an array
  
    let updatedData: Partial<UpdateUserDto> = { ...rest };
  
    // Hash the password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updatedData.password = hashedPassword;
    }
  
    return this.prisma.users.update({
      where: { id },
      data: {
        ...updatedData,
        departments: departmentIds.length > 0 ? { set: departmentIds.map((id) => ({ id })) } : undefined, // Only update departments if provided
      },
    });
  }
  
  

  async getManagersByHOD(hodId: number) {
    return this.prisma.users.findMany({
      where: {
        userType: 'MANAGER',
        hodId, 
      },
    });
  }

  async getExecutivesByManager(managerId: number) {
    return this.prisma.users.findMany({
      where: {
        userType: 'EXECUTIVE',
        managerId, 
      },
    });
  }

async findById(id: number) {
  return this.prisma.users.findUnique({
    where: { id },
    select: { id: true, username: true },
  });
}



  async getAllUsers() {
    return this.prisma.users.findMany({
      include: {
        departments: true, 
      },
    });
  }
  

  async getUserById(id: number) {
    return this.prisma.users.findUnique({
      where: { id },
      include: {
        departments: true, 
      },
    });
  }

  async fetchTasksById(userId: number) {
    const numericId = Number(userId);
  
    if (isNaN(numericId)) {
      throw new NotFoundException(`Invalid User ID: ${userId}`);
    }
  
    const tasks = await this.prisma.task.findMany({
      where: {
        OR: [
          { hodId: numericId },
          { managerId: numericId },
          { executiveId: numericId },
        ],
      },
      include: {
        service: {
          select: { serviceName: true },
        },
        department: {
          select: { departmentName: true },
        },
        customer: {
          select: { customerName: true },
        },
        site: {
          select: { siteName: true },
        },
      },
    });
  
    if (!tasks || tasks.length === 0) {
      throw new NotFoundException(`No tasks found for user with ID ${userId}`);
    }
  
    return tasks;
  }
  
  

  async getUsersByType(userType: string) {
    return this.prisma.users.findMany({
      where: { userType },
    });
  }

  async getHODs() {
    return this.getUsersByType('HOD');
  }

  async getExecutives() {
    return this.getUsersByType('EXECUTIVE');
  }

  async getManagers() {
    return this.getUsersByType('MANAGER');
  }

  async getHODsByDepartment(departmentName: string) {
    return this.prisma.users.findMany({
      where: {
        userType: 'HOD',
        departments: {  
          some: {       
            departmentName: departmentName, 
          },
        },
      },
      include: {
        departments: true, 
      },
    });
  }

  async getManagersByDepartment(departmentName: string) {
    return this.prisma.users.findMany({
      where: {
        userType: 'MANAGER',
        departments: {  
          some: {       
            departmentName: departmentName, 
          },
        },
      },
      include: {
        departments: true, 
      },
    });
  }

  async getExecutiveByDepartment(departmentName: string) {
    return this.prisma.users.findMany({
      where: {
        userType: 'EXECUTIVE',
        departments: {  
          some: {       
            departmentName: departmentName, 
          },
        },
      },
      include: {
        departments: true, 
      },
    });
  }

 

  async deleteUser(id: number) {
    return this.prisma.users.delete({
      where: { id },
    });
  }
}
