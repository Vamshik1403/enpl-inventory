import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  // Get all tasks
  @Get()
  async findAll() {
    return this.taskService.findAll();
  }
  
  @Get('services/:departmentId')
  async findServicesByDepartment(@Param('departmentId') departmentId: number) {
    return this.taskService.findServicesByDepartment(departmentId);
  }

  @Get('user/:userId')
  async findTasksByUser(@Param('userId') userId: number) {
    return this.taskService.findTasksByUser(userId);
  }

  // Create a new task
  @Post()
  async create(@Body() createTaskDto: CreateTaskDto) {
    return this.taskService.create(createTaskDto);
  }

  // Update an existing task by id
  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateTaskDto: UpdateTaskDto) {
    return this.taskService.update(id, updateTaskDto);
  }

  // Delete a task by id
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.taskService.remove(id);
  }
}
