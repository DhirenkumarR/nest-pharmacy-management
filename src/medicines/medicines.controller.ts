import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MedicinesService } from './medicines.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { GetMedicinesQueryDto } from './dto/get-medicines-query.dto';
import { GetMedicinesDropdownQueryDto } from './dto/get-medicines-dropdown-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Medicines')
@ApiBearerAuth('JWT-auth')
@Controller('medicines')
@UseGuards(JwtAuthGuard)
export class MedicinesController {
  constructor(private readonly medicinesService: MedicinesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new medicine' })
  @ApiResponse({
    status: 201,
    description: 'The medicine has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input payload.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Supplier not found.' })
  create(@Body() createMedicineDto: CreateMedicineDto) {
    return this.medicinesService.create(createMedicineDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve medicines list with pagination, search, and filters',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated medicines list returned successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findAll(@Query() query: GetMedicinesQueryDto) {
    return this.medicinesService.findAll(query);
  }

  @Get('dropdown')
  @ApiOperation({
    summary:
      'Retrieve paginated and searchable medicines list for dropdown selection',
  })
  @ApiResponse({
    status: 200,
    description: 'Dropdown medicines list returned successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getDropdownList(@Query() query: GetMedicinesDropdownQueryDto) {
    return this.medicinesService.getDropdownList(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a single medicine by ID' })
  @ApiResponse({
    status: 200,
    description: 'Medicine details returned successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Medicine not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.medicinesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing medicine by ID' })
  @ApiResponse({ status: 200, description: 'Medicine successfully updated.' })
  @ApiResponse({ status: 400, description: 'Invalid input payload.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Medicine or Supplier not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMedicineDto: UpdateMedicineDto,
  ) {
    return this.medicinesService.update(id, updateMedicineDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a medicine by ID' })
  @ApiResponse({ status: 204, description: 'Medicine successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Medicine not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.medicinesService.remove(id);
  }
}
