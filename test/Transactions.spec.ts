/* eslint-disable prettier/prettier */
/* eslint-disable no-use-before-define */
/* eslint-disable prettier/prettier */
import { afterAll, beforeAll, expect, it } from 'vitest'
import { app } from '../src/app'
import request from 'supertest'
import { describe } from 'node:test'
import { execSync } from 'node:child_process'

describe( 'Transactions routes', () => {

  
  beforeAll(async() => {
    execSync('npm rum knex migrate:rollback --all')
    execSync('npm rum knex migrate:latest')
    await app.ready()
  })
  
  afterAll(async () => {
    await  app.close()
  })
  

  it('user can create a new transaction', async () => {
 await request (app.server)
    .post('/transactions')
    .send({
      title:'new Transaction',
      amount: 6540,
      type: "credit"
    }).expect(201) })

    it('should be able to list all transactions', async () => {
      const createTransactionResponse = await request(app.server)
        .post('/transactions')
        .send({
          title:'New transaction',
          amount: 5000,
          type: 'credit',
        })
  
      const cookies = createTransactionResponse.get('Set-Cookie')
  
      if (!cookies) throw new Error ('error!!')
      const listTransactionsResponse = await request(app.server)
        .get('/transactions')
        .set('Cookie', cookies)
        .expect(200)
  
      expect(listTransactionsResponse.body.transactions).toEqual([
        expect.objectContaining({
          title:'New transaction',
          amount: 5000,
        }),
      ])
    })
  
})