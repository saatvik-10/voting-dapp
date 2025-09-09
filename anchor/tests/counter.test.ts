import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import type { Voting } from '../target/types/voting'
import { BankrunProvider, startAnchor } from 'anchor-bankrun'

const IDL = require('../target/idl/voting.json')

const votingAddress = new PublicKey('FqzkXZdwYjurnUKetJCAvaUw5WAqbwzU6gZEwydeEfqS')

describe('Voting', () => {
  it('Initialize Poll', async () => {
    const context = await startAnchor('', [{ name: 'voting', programId: votingAddress }], [])
    const provider = new BankrunProvider(context)

    const votingProgram = new Program<Voting>(IDL, provider)

    await votingProgram.methods
      .initializePoll(
        new anchor.BN(1), //method to do u64 in ts
        'MESSI or RONALDO?',
        new anchor.BN(0),
        new anchor.BN(1857402735),
      )
      .rpc()
  })
})
