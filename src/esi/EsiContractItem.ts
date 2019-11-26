export default interface EsiContractItem {
    is_blueprint_copy: boolean
    is_included: boolean
    item_id?: bigint
    material_efficiency: number
    quantity: number
    record_id: bigint
    runs: number
    time_efficiency: number
    type_id: number,
    name?: string
}