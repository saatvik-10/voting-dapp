import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import type { Voting } from '../target/types/voting'
import { BankrunProvider, startAnchor } from 'anchor-bankrun'

const IDL = require('../target/idl/voting.json')

const votingAddress = new PublicKey('FqzkXZdwYjurnUKetJCAvaUw5WAqbwzU6gZEwydeEfqS')

describe('Voting', () => {
  let context
  let provider
  let votingProgram

  beforeAll(async () => {
    context = await startAnchor('', [{ name: 'voting', programId: votingAddress }], [])
    provider = new BankrunProvider(context)

    votingProgram = new Program<Voting>(IDL, provider)
  })

  it('Initialize Poll', async () => {
    const pollId = new anchor.BN(1)

    await votingProgram.methods
      .initializePoll(
        pollId, //method to do u64 in ts
        'Who is the GOAT?',
        new anchor.BN(0),
        new anchor.BN(1857402735),
      )
      .rpc()

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [pollId.toArrayLike(Buffer, 'le', 8)],
      votingAddress,
    )

    const poll = await votingProgram.account.poll.fetch(pollAddress)

    console.log(poll)

    expect(poll.pollId.toNumber()).toEqual(1)
    expect(poll.description).toEqual('Who is the GOAT?')
    expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber())
  })

  it('Initialize Candidate', async () => {
    const playerId = new anchor.BN(1);

    await votingProgram.methods.initializeCandidate('MESSI', playerId).rpc()

    const [messiAddress] = PublicKey.findProgramAddressSync(
      [playerId.toArrayLike(Buffer, 'le', 8), Buffer.from('MESSI')],
      votingAddress,
    )

    const messiPlayer = await votingProgram.account.candidate.fetch(messiAddress)

    await votingProgram.methods.initializeCandidate('RONALDO', playerId).rpc()

    const [ronaldoAddress] = PublicKey.findProgramAddressSync(
      [playerId.toArrayLike(Buffer, 'le', 8), Buffer.from('RONALDO')],
      votingAddress,
    )

    const ronaldoPlayer = await votingProgram.account.candidate.fetch(ronaldoAddress)

    console.log(messiPlayer)
    console.log(ronaldoPlayer)
  })

  it('vote', async () => { })
})

