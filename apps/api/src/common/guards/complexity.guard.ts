import { Injectable, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { getComplexity, simpleEstimator } from 'graphql-query-complexity';

@Injectable()
export class ComplexityGuard {
  private readonly maxComplexity = 100; // Adjust based on your needs

  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const info = ctx.getInfo();
    const complexity = getComplexity({
      estimators: [
        simpleEstimator({ defaultComplexity: 1 }),
      ],
      schema: info.schema,
      query: info.operation,
    });

    if (complexity > this.maxComplexity) {
      throw new GraphQLError(
        `Query is too complex: ${complexity}. Maximum allowed complexity: ${this.maxComplexity}`,
        {
          extensions: {
            code: 'QUERY_TOO_COMPLEX',
            complexity,
            maxComplexity: this.maxComplexity,
          },
        },
      );
    }

    return true;
  }
}
