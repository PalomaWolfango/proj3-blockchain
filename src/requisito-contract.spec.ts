/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context } from 'fabric-contract-api';
import { ChaincodeStub, ClientIdentity } from 'fabric-shim';
import { RequisitoContract } from '.';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import winston = require('winston');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext implements Context {
    public stub: sinon.SinonStubbedInstance<ChaincodeStub> = sinon.createStubInstance(ChaincodeStub);
    public clientIdentity: sinon.SinonStubbedInstance<ClientIdentity> = sinon.createStubInstance(ClientIdentity);
    public logger = {
        getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
        setLevel: sinon.stub(),
     };
}

describe('RequisitoContract', () => {

    let contract: RequisitoContract;
    let ctx: TestContext;

    beforeEach(() => {
        contract = new RequisitoContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"description":"requisito 1001 description"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"description":"requisito 1002 description"}'));
    });

    describe('#requisitoExists', () => {

        it('should return true for a requisito', async () => {
            await contract.requisitoExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a requisito that does not exist', async () => {
            await contract.requisitoExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createRequisito', () => {

        it('should create a requisito', async () => {
            await contract.createRequisito(ctx, '1003', 'requisito 1003 description', 'requisito 1003 project_id');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"description":"requisito 1003 description"}'));
        });

        it('should throw an error for a requisito that already exists', async () => {
            await contract.createRequisito(ctx, '1001', 'mydescription', 'project_id').should.be.rejectedWith(/The requisito 1001 already exists/);
        });

    });

    describe('#readRequisito', () => {

        it('should return a requisito', async () => {
            await contract.readRequisito(ctx, '1001').should.eventually.deep.equal({ value: 'requisito 1001 value' });
        });

        it('should throw an error for a requisito that does not exist', async () => {
            await contract.readRequisito(ctx, '1003').should.be.rejectedWith(/The requisito 1003 does not exist/);
        });

    });

    describe('#updateRequisito', () => {

        it('should update a requisito', async () => {
            await contract.updateRequisito(ctx, '1001', 'requisito 1001 new description');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"description":"requisito 1001 new description"}'));
        });

        it('should throw an error for a requisito that does not exist', async () => {
            await contract.updateRequisito(ctx, '1003', 'requisito 1003 new description').should.be.rejectedWith(/The requisito 1003 does not exist/);
        });

    });

    describe('#deleteRequisito', () => {

        it('should delete a requisito', async () => {
            await contract.deleteRequisito(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a requisito that does not exist', async () => {
            await contract.deleteRequisito(ctx, '1003').should.be.rejectedWith(/The requisito 1003 does not exist/);
        });

    });

});
