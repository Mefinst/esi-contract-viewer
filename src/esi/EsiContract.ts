import EsiContractItem from '@/esi/EsiContractItem'

export default interface EsiContract {
    buyout?: number
    collateral?: number
    contract_id: number
    date_expired: string
    date_issued: string
    days_to_complete: number
    start_location_id?: bigint
    end_location_id?: bigint
    issuer_id: number
    issuer_corporation_id: number
    price?: number
    reward?: number
    title?: string
    type: 'unknown' | 'item_exchange' | 'auction' | 'courier' | 'loan'
    volume: number,
    items?: Array<EsiContractItem>
}