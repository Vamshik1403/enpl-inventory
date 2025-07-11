import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Get()
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Get('fetchTaskById/:userId')
async fetchTasksById(@Param('userId') userId: number) {
  return this.userService.fetchTasksById(userId);
}


  @Get('/hods/:departmentName')
  async getHODsByDepartment(@Param('departmentName') departmentName: string) {
    return this.userService.getHODsByDepartment(departmentName);
  }

  @Get('/manager/:departmentName')
  async getManagersByDepartment(@Param('departmentName') departmentName: string) {
    return this.userService.getManagersByDepartment(departmentName);
  }

  @Get('/executive/:departmentName')
  async getExecutiveByDepartment(@Param('departmentName') departmentName: string) {
    return this.userService.getExecutiveByDepartment(departmentName);
  }

  @Get('/hods')
  async getHODs() {
    return this.userService.getHODs();
  }

    @Get('/managers/hod/:hodId')
  async getManagersByHOD(@Param('hodId') hodId: number) {
    return this.userService.getManagersByHOD(Number(hodId));
  }
  
  @Get('/executives/manager/:managerId')
  async getExecutivesByManager(@Param('managerId') managerId: number) {
    return this.userService.getExecutivesByManager(Number(managerId));
  }
  
  @Get('/executives')
    async getExecutives() {
      return this.userService.getExecutives();
    }
  
  @Get('/managers')
  async getManagers() {
    return this.userService.getManagers();
  }

  @Get(':id')
  async getUserById(@Param('id') id: number) {
    return this.userService.getUserById(Number(id));
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(Number(id), updateUserDto);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: number) {
    return this.userService.deleteUser(Number(id));
  }
}
