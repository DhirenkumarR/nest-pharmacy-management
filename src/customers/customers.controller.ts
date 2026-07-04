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
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { GetCustomersQueryDto } from './dto/get-customers-query.dto';
import { GetCustomersDropdownQueryDto } from './dto/get-customers-dropdown-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Customers')
@ApiBearerAuth('JWT-auth')
@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({
    status: 201,
    description: 'The customer has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input payload.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve customers list with pagination and search',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated customers list returned successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findAll(@Query() query: GetCustomersQueryDto) {
    return this.customersService.findAll(query);
  }

  @Get('dropdown')
  @ApiOperation({
    summary:
      'Retrieve paginated and searchable customers list for dropdown selection',
  })
  @ApiResponse({
    status: 200,
    description: 'Dropdown customers list returned successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getDropdownList(@Query() query: GetCustomersDropdownQueryDto) {
    return this.customersService.getDropdownList(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a single customer by ID' })
  @ApiResponse({
    status: 200,
    description: 'Customer details returned successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Customer not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing customer by ID' })
  @ApiResponse({ status: 200, description: 'Customer successfully updated.' })
  @ApiResponse({ status: 400, description: 'Invalid input payload.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Customer not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a customer by ID' })
  @ApiResponse({ status: 204, description: 'Customer successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Customer not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.remove(id);
  }
}
