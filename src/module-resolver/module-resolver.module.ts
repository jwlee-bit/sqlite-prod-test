import { DynamicModule, Module } from '@nestjs/common';

const PROMIDE = 'MODULE_RESOLVER_OPTIONS';
const RESOLVER = 'MODULE_RESOLVER';
type SomethingModule = unknown;
// 여기선 쓸때가 없네;;
@Module({})
export class ModuleResolverModule {
  static forRootAsync(params: {
    inject: any[];
    useFactory: (...args: any[]) => any;
  }): DynamicModule {
    return {
      module: ModuleResolverModule,
      providers: [
        {
          provide: PROMIDE,
          inject: params.inject,
          useFactory: params.useFactory,
        },
        {
          provide: RESOLVER,
          inject: [PROMIDE],
          useFactory: (options: SomethingModule) => {
            return options;
          },
        },
      ],
      exports: [RESOLVER],
    };
  }
}
