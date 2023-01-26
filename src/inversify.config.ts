import { Container, BindingScopeEnum } from "inversify";
import getDecorators from "inversify-inject-decorators";

const container = new Container({ defaultScope: BindingScopeEnum.Singleton });
const { lazyInject } = getDecorators(container);

export { container, lazyInject };
