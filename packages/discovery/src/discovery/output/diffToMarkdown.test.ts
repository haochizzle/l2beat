import { expect } from 'earl'

import { EthereumAddress } from '../../utils/EthereumAddress'
import { ContractMeta, DiscoveryMeta, ValueMeta } from '../config/DiscoveryMeta'
import { DiscoveryDiff } from './diffDiscovery'
import {
  contractDiffToMarkdown,
  discoveryDiffToMarkdown,
  fieldDiffToMarkdown,
} from './diffToMarkdown'

const ADDRESS = EthereumAddress.random()

describe(discoveryDiffToMarkdown.name, () => {
  const SECOND_ADDRESS = EthereumAddress.random()

  const FOO_CONTRACT_DIFF: DiscoveryDiff = {
    name: 'foo',
    address: ADDRESS,
    diff: [{ key: 'values.baz', before: 'quax', after: 'quox' }],
  }
  const BAR_CONTRACT_DIFF: DiscoveryDiff = {
    name: 'bar',
    address: SECOND_ADDRESS,
    type: 'deleted',
  }

  const BAR_CONTRACT_META: ContractMeta = {
    name: 'bar',
    description: 'The contract getting deleted',
    values: {},
  }
  const FOO_CONTRACT_META: ContractMeta = {
    name: 'foo',
    description: undefined,
    values: {
      baz: {
        type: 'L2',
        description: 'The foo value',
        severity: 'LOW',
      },
    },
  }
  const DISCOVERY_META: DiscoveryMeta = {
    contracts: [BAR_CONTRACT_META, FOO_CONTRACT_META],
  }

  it('multi contract diff, meta', () => {
    const result = discoveryDiffToMarkdown(
      [FOO_CONTRACT_DIFF, BAR_CONTRACT_DIFF],
      DISCOVERY_META,
    )

    expect(result).toEqual(
      [
        '```diff',
        `    contract foo (${ADDRESS.toString()}) {`,
        '    +++ description: None',
        '+++ description: The foo value',
        '+++ type: L2',
        '+++ severity: LOW',
        '      values.baz:',
        '-        quax',
        '+        quox',
        '    }',
        '```',
        '',
        '```diff',
        '-   Status: DELETED',
        `    contract bar (${SECOND_ADDRESS.toString()})`,
        '    +++ description: The contract getting deleted',
        '```',
      ].join('\n'),
    )
  })

  it('truncating, multiple contracts with meta', () => {
    const maxLength = 128
    const result = discoveryDiffToMarkdown(
      [FOO_CONTRACT_DIFF, BAR_CONTRACT_DIFF],
      DISCOVERY_META,
      maxLength,
    )

    expect(result.length).toBeLessThanOrEqual(maxLength)
    expect(result).toEqual(
      [
        '```diff',
        `    contract foo (${ADDRESS.toString()}) {`,
        '    +++ description: None',
        '++... (message too long)',
        '```',
      ].join('\n'),
    )
  })

  it('truncating, single contract with meta', () => {
    const maxLength = 48
    const result = discoveryDiffToMarkdown(
      [FOO_CONTRACT_DIFF],
      DISCOVERY_META,
      maxLength,
    )

    expect(result.length).toBeLessThanOrEqual(maxLength)
    expect(result).toEqual(
      ['```diff', '    contract f... (message too long)', '```'].join('\n'),
    )
  })

  it('multi contract diff, no meta', () => {
    const result = discoveryDiffToMarkdown(
      [FOO_CONTRACT_DIFF, BAR_CONTRACT_DIFF],
      undefined,
    )

    expect(result).toEqual(
      [
        '```diff',
        `    contract foo (${ADDRESS.toString()}) {`,
        '    +++ description: None',
        '      values.baz:',
        '-        quax',
        '+        quox',
        '    }',
        '```',
        '',
        '```diff',
        '-   Status: DELETED',
        `    contract bar (${SECOND_ADDRESS.toString()})`,
        '    +++ description: None',
        '```',
      ].join('\n'),
    )
  })

  it('single contract diff, no meta', () => {
    const result = discoveryDiffToMarkdown([FOO_CONTRACT_DIFF], undefined)

    expect(result).toEqual(
      [
        '```diff',
        `    contract foo (${ADDRESS.toString()}) {`,
        '    +++ description: None',
        '      values.baz:',
        '-        quax',
        '+        quox',
        '    }',
        '```',
      ].join('\n'),
    )
  })

  it('empty diffs, no meta', () => {
    const result = discoveryDiffToMarkdown([], undefined)
    expect(result).toEqual('')
  })
})

describe(contractDiffToMarkdown.name, () => {
  it('contract creation without diff, no meta', () => {
    const result = contractDiffToMarkdown(
      {
        name: 'foo',
        address: ADDRESS,
        type: 'created',
      },
      undefined,
    )

    expect(result).toEqual(
      [
        '```diff',
        '+   Status: CREATED',
        `    contract foo (${ADDRESS.toString()})`,
        '    +++ description: None',
        '```',
      ].join('\n'),
    )
  })

  it('contract delete without diff, no meta', () => {
    const result = contractDiffToMarkdown(
      {
        name: 'foo',
        address: ADDRESS,
        type: 'deleted',
      },
      undefined,
    )

    expect(result).toEqual(
      [
        '```diff',
        '-   Status: DELETED',
        `    contract foo (${ADDRESS.toString()})`,
        '    +++ description: None',
        '```',
      ].join('\n'),
    )
  })

  it('contract with a known diff, no meta', () => {
    const result = contractDiffToMarkdown(
      {
        name: 'foo',
        address: ADDRESS,
        diff: [
          { key: 'values.bar', before: 'oldValue', after: 'newValue' },
          { key: 'values.baz', before: 'bad', after: 'good' },
        ],
      },
      undefined,
    )

    expect(result).toEqual(
      [
        '```diff',
        `    contract foo (${ADDRESS.toString()}) {`,
        '    +++ description: None',
        '      values.bar:',
        '-        oldValue',
        '+        newValue',
        '      values.baz:',
        '-        bad',
        '+        good',
        '    }',
        '```',
      ].join('\n'),
    )
  })

  it('trucating, no meta', () => {
    const maxLength = 48
    const result = contractDiffToMarkdown(
      {
        name: 'foo',
        address: ADDRESS,
        diff: [
          { key: 'values.bar', before: 'oldValue', after: 'newValue' },
          { key: 'values.baz', before: 'bad', after: 'good' },
        ],
      },
      undefined,
      maxLength,
    )

    expect(result.length).toBeLessThanOrEqual(maxLength)
    expect(result).toEqual(
      ['```diff', `    contract f... (message too long)`, '```'].join('\n'),
    )
  })

  it('contract with a known diff, meta', () => {
    const meta: ContractMeta = {
      name: 'foo',
      description: 'The foo contract',
      values: {
        baz: {
          type: 'L2',
          description: 'The baz value',
          severity: 'LOW',
        },
      },
    }

    const result = contractDiffToMarkdown(
      {
        name: 'foo',
        address: ADDRESS,
        diff: [
          { key: 'values.bar', before: 'oldValue', after: 'newValue' },
          { key: 'values.baz', before: 'bad', after: 'good' },
        ],
      },
      meta,
    )

    expect(result).toEqual(
      [
        '```diff',
        `    contract foo (${ADDRESS.toString()}) {`,
        '    +++ description: The foo contract',
        '      values.bar:',
        '-        oldValue',
        '+        newValue',
        '+++ description: The baz value',
        '+++ type: L2',
        '+++ severity: LOW',
        '      values.baz:',
        '-        bad',
        '+        good',
        '    }',
        '```',
      ].join('\n'),
    )
  })
})

describe(fieldDiffToMarkdown.name, () => {
  it('full, no meta', () => {
    const diff = {
      key: 'values.bar',
      before: 'oldValue',
      after: 'newValue',
    }

    expect(fieldDiffToMarkdown(diff, undefined)).toEqual(
      [
        '      values.bar:', // prettier hack
        '-        oldValue',
        '+        newValue',
      ].join('\n'),
    )
  })

  it('key unset', () => {
    const diff = {
      before: 'oldValue',
      after: 'newValue',
    }

    expect(fieldDiffToMarkdown(diff, undefined)).toEqual(
      [
        '      unknown:', // prettier hack
        '-        oldValue',
        '+        newValue',
      ].join('\n'),
    )
  })

  it('before unset', () => {
    const diff = {
      key: 'values.bar',
      after: 'newValue',
    }

    expect(fieldDiffToMarkdown(diff, undefined)).toEqual(
      [
        '      values.bar:', // prettier hack
        '+        newValue',
      ].join('\n'),
    )
  })

  it('truncating with no meta', () => {
    const diff = {
      key: 'values.bar',
      before: 'oldValue',
      after: 'newValue',
    }

    const maxLength = 32
    const result = fieldDiffToMarkdown(diff, undefined, maxLength)
    expect(result).toEqual('      valu... (message too long)')
    expect(result.length).toBeLessThanOrEqual(maxLength)
  })

  it('all meta information', () => {
    const diff = {
      key: 'values.bar',
      before: 'oldValue',
      after: 'newValue',
    }

    const meta: ValueMeta = {
      type: 'L2',
      description: 'The bar value',
      severity: 'LOW',
    }

    expect(fieldDiffToMarkdown(diff, meta)).toEqual(
      [
        '+++ description: The bar value', // prettier hack
        '+++ type: L2',
        '+++ severity: LOW',
        '      values.bar:',
        '-        oldValue',
        '+        newValue',
      ].join('\n'),
    )
  })

  it('some meta information', () => {
    const diff = {
      key: 'values.bar',
      before: 'oldValue',
      after: 'newValue',
    }

    const meta: ValueMeta = {
      type: 'L2',
      description: null,
      severity: 'LOW',
    }

    expect(fieldDiffToMarkdown(diff, meta)).toEqual(
      [
        '+++ type: L2', // prettier hack
        '+++ severity: LOW',
        '      values.bar:',
        '-        oldValue',
        '+        newValue',
      ].join('\n'),
    )
  })

  it('truncating, all meta information', () => {
    const diff = {
      key: 'values.bar',
      before: 'oldValue',
      after: 'newValue',
    }

    const meta: ValueMeta = {
      type: 'L2',
      description: 'The bar value',
      severity: 'LOW',
    }

    const maxLength = 48
    const result = fieldDiffToMarkdown(diff, meta, maxLength)
    expect(result.length).toBeLessThanOrEqual(maxLength)
    expect(result).toEqual('+++ description: The bar v... (message too long)')
  })
})
