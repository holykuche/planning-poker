import { Container } from "inversify";
import getDecorators from "inversify-inject-decorators";

const container = new Container({ defaultScope: "Singleton" });
const { lazyInject } = getDecorators(container);

export { container, lazyInject };
