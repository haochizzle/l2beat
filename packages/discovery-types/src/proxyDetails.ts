import { z } from 'zod'

import { EthereumAddress } from './EthereumAddress'

export interface ProxyDetails {
  upgradeability: UpgradeabilityParameters
  implementations: EthereumAddress[]
  relatives: EthereumAddress[]
}

export type ManualProxyType = z.infer<typeof ManualProxyType>
export const ManualProxyType = z.enum([
  'new Arbitrum proxy',
  'call implementation proxy',
  'zkSync Lite proxy',
  'zkSpace proxy',
  'Eternal Storage proxy',
  'Polygon Extension proxy',
  'Optics Beacon proxy',
  'immutable',
])

export type UpgradeabilityParameters =
  | ImmutableUpgradeability
  | GnosisSafeUpgradeability
  | GnosisSafeZodiacModuleUpgradeability
  | EIP1967ProxyUpgradeability
  | PolygonProxyUpgradeability
  | ZeppelinOSProxyUpgradeability
  | StarkWareProxyUpgradeability
  | StarkWareDiamondUpgradeability
  | ArbitrumProxyUpgradeability
  | NewArbitrumProxyUpgradeability
  | ResolvedDelegateProxyUpgradeability
  | EIP897ProxyUpgradeability
  | CallImplementationProxyUpgradeability
  | EIP2535ProxyUpgradeability
  | ZkSyncLiteProxyUpgradeability
  | EternalStorageProxyUpgradeability
  | PolygonExtensionProxyUpgradeability
  | ZkSpaceProxyUpgradeability
  | OpticsBeaconProxyUpgradeability
  | AxelarProxyUpgradeability

export interface ImmutableUpgradeability {
  type: 'immutable'
}

export interface GnosisSafeUpgradeability {
  type: 'gnosis safe'
  masterCopy: EthereumAddress
  modules: EthereumAddress[]
}

export interface GnosisSafeZodiacModuleUpgradeability {
  type: 'gnosis safe zodiac module'
  avatar: EthereumAddress
  target: EthereumAddress
  guard: EthereumAddress
  modules?: EthereumAddress[]
}

export interface EIP1967ProxyUpgradeability {
  type: 'EIP1967 proxy'
  admin: EthereumAddress
  implementation: EthereumAddress
}

export interface PolygonProxyUpgradeability {
  type: 'Polygon proxy'
  admin: EthereumAddress
  implementation: EthereumAddress
}

export interface ZeppelinOSProxyUpgradeability {
  type: 'ZeppelinOS proxy'
  admin?: EthereumAddress
  owner?: EthereumAddress
  implementation: EthereumAddress
}

export interface StarkWareProxyUpgradeability {
  type: 'StarkWare proxy'
  implementation: EthereumAddress
  callImplementation?: EthereumAddress
  upgradeDelay: number
  isFinal: boolean
  useConstantDelay?: boolean
  proxyGovernance?: EthereumAddress[]
}

export interface StarkWareDiamondUpgradeability {
  type: 'StarkWare diamond'
  implementation: EthereumAddress
  upgradeDelay: number
  isFinal: boolean
  facets: Record<string, EthereumAddress>
  proxyGovernance?: EthereumAddress[]
}

export interface ArbitrumProxyUpgradeability {
  type: 'Arbitrum proxy'
  admin: EthereumAddress
  adminImplementation: EthereumAddress
  userImplementation: EthereumAddress
}

export interface NewArbitrumProxyUpgradeability {
  type: 'new Arbitrum proxy'
  admin: EthereumAddress
  implementation: EthereumAddress
  adminImplementation: EthereumAddress
  userImplementation: EthereumAddress
}

export interface ResolvedDelegateProxyUpgradeability {
  type: 'resolved delegate proxy'
  addressManager: EthereumAddress
  implementationName: string
  implementation: EthereumAddress
}

export interface EIP897ProxyUpgradeability {
  type: 'EIP897 proxy'
  isUpgradable: boolean
  implementation: EthereumAddress
}

export interface CallImplementationProxyUpgradeability {
  type: 'call implementation proxy'
  implementation: EthereumAddress
}

export interface EIP2535ProxyUpgradeability {
  type: 'EIP2535 diamond proxy'
  facets: EthereumAddress[]
}

export interface ZkSyncLiteProxyUpgradeability {
  type: 'zkSync Lite proxy'
  admin: EthereumAddress
  implementation: EthereumAddress
  additional: EthereumAddress
}

export interface EternalStorageProxyUpgradeability {
  type: 'Eternal Storage proxy'
  admin: EthereumAddress
  implementation: EthereumAddress
}

export interface PolygonExtensionProxyUpgradeability {
  type: 'Polygon Extension proxy'
  admin: EthereumAddress
  implementation: EthereumAddress
  extension: EthereumAddress
}
export interface ZkSpaceProxyUpgradeability {
  type: 'zkSpace proxy'
  admin: EthereumAddress
  implementation: EthereumAddress
  additional: EthereumAddress[]
}

export interface OpticsBeaconProxyUpgradeability {
  type: 'Optics Beacon proxy'
  upgradeBeacon: EthereumAddress
  beaconController: EthereumAddress
  implementation: EthereumAddress
}

export interface AxelarProxyUpgradeability {
  type: 'Axelar proxy'
  admins: EthereumAddress[]
  adminThreshold: number
  owners: EthereumAddress[]
  ownerThreshold: number
  operators: EthereumAddress[]
  operatorThreshold: number
  implementation: EthereumAddress
}
