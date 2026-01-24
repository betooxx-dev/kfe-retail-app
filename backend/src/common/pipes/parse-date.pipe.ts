import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseDatePipe implements PipeTransform {
  transform(value: any) {
    if (!value) throw new BadRequestException('Date query value is required');

    const parsedDate = new Date(value);

    if (isNaN(parsedDate.getTime()))
      throw new BadRequestException(`Invalid date format: ${value}`);

    return parsedDate;
  }
}
