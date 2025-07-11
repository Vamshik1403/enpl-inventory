import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; 
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UserService } from 'src/users/users.service';

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.task.findMany({
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
  }
  
  
  
  async findTasksByUser(userId: number) {
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

    if (tasks.length === 0) {
      throw new NotFoundException(`No tasks found for user with id ${userId}`);
    }

    return tasks;
  }

  async create(createTaskDto: CreateTaskDto) {
    const { managerId, executiveId, hodId, serviceId, departmentId, customerId, siteId, ...taskData } = createTaskDto;
  
    // Validate HOD ID
    const hodExists = await this.prisma.users.findUnique({ where: { id: hodId } });
    if (!hodExists) {
      throw new Error(`HOD with ID ${hodId} not found`);
    }
  
    // Validate Manager ID (if provided)
    if (managerId) {
      const managerExists = await this.prisma.users.findUnique({ where: { id: managerId } });
      if (!managerExists) {
        throw new Error(`Manager with ID ${managerId} not found`);
      }
    }
  
    // Validate Executive ID (if provided)
    if (executiveId) {
      const executiveExists = await this.prisma.users.findUnique({ where: { id: executiveId } });
      if (!executiveExists) {
        throw new Error(`Executive with ID ${executiveId} not found`);
      }
    }
  
    // Build assignedUsers connections
    const assignedUsersConnect = [
      { id: hodId },
      ...(managerId ? [{ id: managerId }] : []),
      ...(executiveId ? [{ id: executiveId }] : []),
    ];
  
    return this.prisma.task.create({
      data: {
        ...taskData,
        hodId,
        managerId: managerId || null,
        executiveId: executiveId || null,
        service: { connect: { id: serviceId } },
        department: { connect: { id: departmentId } },
        customer: { connect: { id: customerId } },
        site: { connect: { id: siteId } },
        assignedUsers: { connect: assignedUsersConnect },
      },
      include: {
        assignedUsers: true,
      },
    });
  }
  
  
  

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    const managerId = updateTaskDto.managerId === -1 ? null : updateTaskDto.managerId;
    const executiveId = updateTaskDto.executiveId === -1 ? null : updateTaskDto.executiveId;
    const existingTask = await this.prisma.task.findUnique({ where: { id } });
    if (!existingTask) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        serviceId: updateTaskDto.serviceId,
        departmentId: updateTaskDto.departmentId,
        customerId: updateTaskDto.customerId,
        siteId:updateTaskDto.siteId,
        workScope: updateTaskDto.workScope,
        proposedDate: updateTaskDto.proposedDate,
        priority: updateTaskDto.priority,
       remark: updateTaskDto.remark,
        status: updateTaskDto.status,
        hodId:updateTaskDto.hodId,
        managerId,
        executiveId,
      },
    });
  }

  async remove(id: number) {
    const existingTask = await this.prisma.task.findUnique({ where: { id } });
    if (!existingTask) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }

    return this.prisma.task.delete({ where: { id } });
  }

  
async findServicesByDepartment(departmentId: number) {
  
  const parsedDepartmentId = parseInt(departmentId.toString(), 10);

  
  const services = await this.prisma.service.findMany({
    where: {
      departmentId: parsedDepartmentId,
    },
  });

  return services;
}
}
