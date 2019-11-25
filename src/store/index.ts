import Vue from 'vue'
import Vuex from 'vuex'
import Esi from '@/esi/Esi'
import EsiContract from '@/esi/EsiContract'
import EsiRegion from '@/esi/EsiRegion'
import EsiContractItem from '@/esi/EsiContractItem'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        regions: new Map<number, EsiRegion>(),
        contracts: new Map<number, Map<number, EsiContract>>(),
        contractItems: new Map<number, Array<EsiContractItem>>()
    },
    mutations: {
        setRegions(state, regions: Map<number, EsiRegion>) {
            state.regions = regions
        },
        setContracts(state, contracts: Map<number, Map<number, EsiContract>>) {
            state.contracts = contracts
        },
        addContract(state, {contract, regionId}: {contract: EsiContract, regionId: number}) {
            let regionIndex = state.contracts.get(regionId)
            if(regionIndex)
                regionIndex.set(contract.contract_id, contract)
            else {
                regionIndex = new Map()
                state.contracts.set(regionId, regionIndex)
                regionIndex.set(contract.contract_id, contract)
            }
        },
        addContractItems(state, {contractId, contractItems}: { contractId: number, contractItems: Array<EsiContractItem> }) {
            state.contractItems.set(contractId, contractItems)
        }
    },
    actions: {
        async loadRegions({commit}) {
            const regionEntries = (await Promise.all((await Esi.getRegions()).map(async id => ([id, await Esi.getRegion(id)]))))
            // @ts-ignore
            const regions = new Map<number, EsiRegion>(regionEntries)
            commit('setRegions', regions)
        },
        async loadContracts({state, commit, dispatch}, regionId: number) {
            const contracts = await Esi.getPublicContractsAll(regionId)

            for (let contract of contracts) {
              dispatch('loadContractItems', contract.contract_id)
              commit('addContract', {contract, regionId})
            }
        },

        async loadContractItems({commit}, contractId: number) {
            const contractItems = await Esi.getContractItems(contractId)
            commit('addContractItems', {contractId, contractItems})
        }
    },
    modules: {}
})
