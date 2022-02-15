/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { Requisito } from './requisito';

@Info({title: 'RequisitoContract', description: 'My Smart Contract' })
export class RequisitoContract extends Contract {

    @Transaction(false)
    @Returns('boolean')
    public async requisitoExists(ctx: Context, idRequisito: string): Promise<boolean> {
        const data: Uint8Array = await ctx.stub.getState(idRequisito);
        return (!!data && data.length > 0);
    }

    @Transaction()
    public async createRequisito(ctx: Context, idRequisito: string, description: string, projectId: string): Promise<void> {
        const exists: boolean = await this.requisitoExists(ctx, idRequisito);
        if (exists) {
            throw new Error(`The requisito ${idRequisito} already exists 2!`);
        }

        //Validações do requisito
        if (projectId.length === 0 || projectId == undefined) {
            throw new Error(`Please enter something in project ID !`);
        }

        if (description.length === 0 || description == undefined) {
            throw new Error(`Please enter something in description !`)
        }

        const requisito: Requisito = new Requisito();
        requisito.idRequisito = idRequisito
        requisito.description = description;
        requisito.projectId = projectId;
        const buffer: Buffer = Buffer.from(JSON.stringify(requisito));
        await ctx.stub.putState(idRequisito, buffer);
        
    }

    @Transaction(false)
    @Returns('Requisito')
    public async readRequisito(ctx: Context, idRequisito: string): Promise<Requisito> {
        const exists: boolean = await this.requisitoExists(ctx, idRequisito);
        if (!exists) {
            throw new Error(`The requisito ${idRequisito} does not exist`);
        }
        const data: Uint8Array = await ctx.stub.getState(idRequisito);
        const requisito: Requisito = JSON.parse(data.toString()) as Requisito;
        return requisito;
    }

    @Transaction(false)
    @Returns('string')
    public async readAllRequisitos(ctx: Context): Promise<string> {
        const allResults = [];
        const data =  await ctx.stub.getStateByRange('', '');
        let result = await data.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await data.next();
        }
        return JSON.stringify(allResults);
    }
    

    @Transaction()
    public async updateRequisito(ctx: Context, idRequisito: string, newDescription: string, projectId: string): Promise<void> {
        const exists: boolean = await this.requisitoExists(ctx, idRequisito);
        if (!exists) {
            throw new Error(`The requisito ${idRequisito} does not exist`);
        }
        const requisito: Requisito = new Requisito();
        requisito.idRequisito = idRequisito;
        requisito.description = newDescription;
        requisito.projectId = projectId;
        const buffer: Buffer = Buffer.from(JSON.stringify(requisito));
        await ctx.stub.putState(idRequisito, buffer);
    }

    @Transaction()
    public async deleteRequisito(ctx: Context, idRequisito: string): Promise<void> {
        const exists: boolean = await this.requisitoExists(ctx, idRequisito);
        if (!exists) {
            throw new Error(`The requisito ${idRequisito} does not exist`);
        }
        await ctx.stub.deleteState(idRequisito);
    }


}
