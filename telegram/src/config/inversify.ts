import {Container, BindingScopeEnum} from 'inversify';

const container = new Container({defaultScope: BindingScopeEnum.Singleton});

export {container};
