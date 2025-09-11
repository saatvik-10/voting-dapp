import { ActionGetResponse, ActionPostRequest, ACTIONS_CORS_HEADERS, createPostResponse } from '@solana/actions'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import type { Voting } from '../../../../anchor/target/types/voting'
import { Program, BN } from '@coral-xyz/anchor'

const IDL = require('../../../../anchor/target/idl/voting.json')

export const OPTIONS = GET

export async function GET(request: Request) {
  const actionMetadata: ActionGetResponse = {
    icon: 'https://cdn-thegame.imago-images.com/wp-content/uploads/imago11280425-1160x1055.jpg',
    title: 'Who is the GOAT?',
    description: 'Messi or Ronaldo?',
    label: 'Vote',
    links: {
      actions: [
        {
          label: 'Messi',
          href: '/api/vote?candidate=Messi',
          type: 'post',
        },
        {
          label: 'Ronaldo',
          href: '/api/vote?candidate=Ronaldo',
          type: 'post',
        },
      ],
    },
  }
  return Response.json(actionMetadata, {
    headers: ACTIONS_CORS_HEADERS,
  })
}

export async function POST(request: Request) {
  const url = new URL(request.url)
  const candidate = url.searchParams.get('candidate')

  if (candidate != 'Messi' && candidate != 'Ronaldo') {
    return new Response('Invalid Candidate', {
      status: 400,
      headers: ACTIONS_CORS_HEADERS,
    })
  }

  const connection = new Connection('http://127.0.0.1:8899', 'confirmed')
  const program: Program<Voting> = new Program(IDL, { connection })

  const body: ActionPostRequest = await request.json()
  let voter = new PublicKey(body.account)

  try {
    voter = new PublicKey(body.account)
  } catch (err) {
    return new Response('Invalid Account', {
      status: 400,
      headers: ACTIONS_CORS_HEADERS,
    })
  }

  const instruction = await program.methods
    .vote(candidate, new BN(1))
    .accounts({
      signer: voter,
    })
    .instruction()

  const blockHash = await connection.getLatestBlockhash()

  const transaction = new Transaction({
    feePayer: voter,
    blockhash: blockHash.blockhash,
    lastValidBlockHeight: blockHash.lastValidBlockHeight,
  }).add(instruction)

  const res = await createPostResponse({
    fields: {
      type: 'transaction',
      transaction: transaction,
    },
  })

  return Response.json(res, {
    headers: ACTIONS_CORS_HEADERS,
  })
}
