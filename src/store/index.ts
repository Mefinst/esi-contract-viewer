import Vue from 'vue'
import Vuex from 'vuex'
import Esi from '@/esi/Esi'
import EsiContract from '@/esi/EsiContract'
import EsiRegion from '@/esi/EsiRegion'
import EsiContractItem from '@/esi/EsiContractItem'

Vue.use(Vuex)

type Index<Value> = { [key: number]: Value }
export default new Vuex.Store({
    state: {
        regionsLoaded: false,
        regionsIndexed: {} as Index<EsiRegion>,
        contractsIndexed: {} as Index<EsiContract>,
        contractItemsIndexed: {} as Index<Array<EsiContractItem>>,
        contractsPerRegion: {} as Index<Array<number>>,
        contractsPerItem: {} as Index<Array<number>>,
        itemNames: {} as Index<string>
    },
    mutations: {
        setRegions(state, regions: Index<EsiRegion>) {
            state.regionsIndexed = regions
        },
        setContracts(state, contracts: Index<EsiContract>) {
            state.contractsIndexed = contracts
        },
        addContract(state, {contract, regionId}: { contract: EsiContract, regionId: number }) {
            Vue.set(state.contractsIndexed, contract.contract_id, contract)

            if (state.contractsPerRegion[regionId] == null)
                Vue.set(state.contractsPerRegion, regionId, [])
            state.contractsPerRegion[regionId].push(contract.contract_id)
        },
        addContractItems(state, {contractId, contractItems}: { contractId: number, contractItems: Array<EsiContractItem> }) {
            Vue.set(state.contractItemsIndexed, contractId, contractItems)

            for (const item of contractItems) {
                if (state.contractsPerItem[item.type_id] == null)
                    Vue.set(state.contractsPerItem, item.type_id, [])
                state.contractsPerItem[item.type_id].push(contractId)
            }
        },
        addItemName(state, {id, name}: { id: number, name: string }) {
            Vue.set(state.itemNames, id, name)
        }
    },
    actions: {
        async loadRegions({state, commit}) {
            if (state.regionsLoaded) return

            const regionEntries = (await Promise.all((await Esi.getRegions()).map(async id => ([id, await Esi.getRegion(id)]))))
            const regions = Object.fromEntries(regionEntries)
            commit('setRegions', regions)

            state.regionsLoaded = true
        },

        async loadContracts({state, commit, dispatch}, regionId: number) {
            const contracts = await Esi.getPublicContractsAll(regionId)

            for (let contract of contracts) {
                if (contract.type === 'item_exchange')
                    dispatch('loadContractItems', contract.contract_id)
                commit('addContract', {contract, regionId})
            }
        },

        async loadContractItems({state, commit}, contractId: number) {
            const contractItems = await Esi.getContractItems(contractId)
            if (contractItems != null)
                commit('addContractItems', {contractId, contractItems})

            const noNameItems = contractItems.filter(item => state.itemNames[item.type_id] == null)
            const noNameItemIdsDistinct = [...new Set(noNameItems.map(item => item.type_id))]

            const names = noNameItemIdsDistinct.length > 0 ? await Esi.names(noNameItemIdsDistinct) : null
            if (names != null)
                for (const name of names)
                    commit('addItemName', name)

        }

    },
    getters: {
        contracts: (state) => {
            return Object.entries(state.contractsIndexed).map(([, value]) => value)
        },
        regions: (state) => {
            return Object.entries(state.regionsIndexed).map(([, value]) => value)
        }
    }
})
