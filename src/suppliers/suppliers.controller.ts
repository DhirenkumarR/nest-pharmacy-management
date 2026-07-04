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
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { GetSuppliersQueryDto } from './dto/get-suppliers-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Suppliers')
@ApiBearerAuth('JWT-auth')
@Controller('suppliers')
@UseGuards(JwtAuthGuard)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new supplier' })
  @ApiResponse({
    status: 201,
    description: 'The supplier has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input payload.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.suppliersService.create(createSupplierDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve suppliers list with pagination and search',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated suppliers list returned successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findAll(@Query() query: GetSuppliersQueryDto) {
    return this.suppliersService.findAll(query);
  }

  @Get('dropdown')
  @ApiOperation({
    summary:
      'Retrieve list of all suppliers with only ID and name for dropdowns',
  })
  @ApiResponse({
    status: 200,
    description: 'Suppliers list for dropdown returned successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getDropdownList() {
    return this.suppliersService.getDropdownList();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a single supplier by ID' })
  @ApiResponse({
    status: 200,
    description: 'Supplier details returned successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Supplier not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.suppliersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing supplier by ID' })
  @ApiResponse({ status: 200, description: 'Supplier successfully updated.' })
  @ApiResponse({ status: 400, description: 'Invalid input payload.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Supplier not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    return this.suppliersService.update(id, updateSupplierDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a supplier by ID' })
  @ApiResponse({ status: 204, description: 'Supplier successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Supplier not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.suppliersService.remove(id);
  }
}
