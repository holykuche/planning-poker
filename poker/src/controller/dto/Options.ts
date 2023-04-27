export default interface Options<E> {

    indexBy?: (keyof E)[];

    primaryKey?: keyof E;

    initialPrimaryKeyValue?: E[ keyof E ];

    getNextPrimaryKeyValue?: (current: E[ keyof E ]) => E[ keyof E ];

}
