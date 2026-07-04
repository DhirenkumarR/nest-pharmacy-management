import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { GetSalesQueryDto } from './dto/get-sales-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest {
  user: {
    admin_id: number;
    email: string;
    name: string;
  };
}

@ApiTags('Sales')
@ApiBearerAuth('JWT-auth')
@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new sale transaction (POS checkout)' })
  @ApiResponse({
    status: 201,
    description: 'The sale transaction was registered successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input payload or insufficient stock.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Customer or Medicine not found.' })
  create(
    @Body() createSaleDto: CreateSaleDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const adminId = req.user.admin_id;
    return this.salesService.create(createSaleDto, adminId);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve sales log with pagination and search' })
  @ApiResponse({
    status: 200,
    description: 'Paginated sales log returned successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findAll(@Query() query: GetSalesQueryDto) {
    return this.salesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve a single sale transaction by ID with details',
  })
  @ApiResponse({
    status: 200,
    description: 'Sale transaction details returned successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Sale transaction not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.salesService.findOne(id);
  }
}
