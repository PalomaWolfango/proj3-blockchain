/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Object, Property } from 'fabric-contract-api';

@Object()
export class Requisito {

    @Property()
    public idRequisito: string;

    @Property()
    public description: string;

    @Property()
    public projectId: string;

}
