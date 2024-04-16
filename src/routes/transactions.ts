/* eslint-disable prettier/prettier */
import { FastifyInstance } from 'fastify'
import {z} from 'zod'
import { knex } from '../database'
import crypto, { randomUUID } from 'node:crypto'
import { cookiesMiddlewares } from '../middlewares/check-session-id'

export async function transactionsRoutes(app:FastifyInstance) {
    


  app.get("/", {preHandler: cookiesMiddlewares}, async (request) => {
    const sessionId = request.cookies.sessionId

    const getTransactions = await knex('transactions').where('session_id',sessionId).select('*')

    return {getTransactions}
  })
  
  app.get("/:id", {preHandler: cookiesMiddlewares},async (request) => {
    const sessionId = request.cookies.sessionId

    const getTransactionParams = z.object({
        id: z.string().uuid()
    })
    const {id} = getTransactionParams.parse(request.params)

    const transaction = await knex("transactions").where({id, 'session_id': sessionId}).first()


    return {transaction}
  })

  app.get("/summary", {preHandler: cookiesMiddlewares},async (request) => {
    const sessionId = request.cookies.sessionId

    const transaction = await knex("transactions").where({session_id: sessionId}).sum('amount', { as: "amount"}).first()


    return {transaction}
  })
  app.post('/', async (request, reply) => {
    // {title, amount, type: credit || debit }
 
    const createTransactionsBodySchema = z.object({
        title: z.string(),
        amount: z.number(),
        type: z.enum(['credit', 'debit'])
    })
    const {title, amount, type} = createTransactionsBodySchema.parse(request.body)
   
    let sessionId = request.cookies.sessionId

    if(!sessionId){
        sessionId = randomUUID()

        reply.cookie('sessionId', sessionId, {
            path: '/',
          
    }
  )}
 await knex('transactions').insert({
        id: crypto.randomUUID(),
        title,
        amount : type ===   'credit' ? amount : amount * -1,
        session_id: sessionId
    })
   return reply.status(201).send()
  })
}
