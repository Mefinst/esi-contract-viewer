<template>
    <div class="home">
        <div class="filter-panel">
            <label>
                <span>Region</span>
                <select v-model="selectedRegion">
                    <option v-for="region of regions" :key="region.region_id" :value="region.region_id">
                        {{region.name}}
                    </option>
                </select>
            </label>
            <label>
                Type
                <select disabled v-model="contractType">
                    <option value="item_exchange" selected>Trade</option>
                    <option value="courier">Courier</option>
                    <option value="auction">Auction</option>
                    <option value="loan">Loan</option>
                </select>
            </label>
            <label>
                <span>Should include</span>
                <input type="text" v-model="slowSearch" list="searchTypes">
                <datalist id="searchTypes">
                    <option v-for="item of searchAutocomplete" :key="item.id" :value="item.name">{{item.name}}</option>
                </datalist>
            </label>
            <label>
                <input type="checkbox" v-model="exactType" @change="onSearch">
                <span>Exact type</span>
            </label>
            <label>
                <span>Page</span>
                <input type="number" min="0" step="1" v-model="slowPage">
            </label>
            <button v-on:click="getContracts">Get Contracts</button>
        </div>
        <ContractList :contracts="filteredContracts"/>
    </div>
</template>

<script lang="js">
    // @ is an alias to /src
    import ContractList from "@/components/ContractList"
    import Esi from "@/esi/Esi"
    import {mapActions, mapGetters, mapState} from "vuex"
    import {debounce} from 'lodash'

    export default {
        name: 'home',
        components: {
            ContractList
        },
        data() {
            return {
                selectedRegion: null,
                contractType: 'item_exchange',
                search: '',
                searchAutocomplete: [],
                shouldInclude: [],
                exactType: false,
                page: 1
            }
        },
        computed: {
            ...mapState([
                'regionsIndexed',
                'contractsIndexed',
                'contractItemsIndexed',
                'contractsPerRegion',
                'contractsPerItem',
                'itemNames'
            ]),
            ...mapGetters(['regions']),
            slowSearch: {
                get() {
                    return this.search
                },
                set(value) {
                    this.search = value
                    this.onSearch()
                }
            },
            slowPage: {
                get() {
                    return this.page
                },
                set: debounce(function (value) {
                    this.page = value
                }, 50)
            },
            filteredContracts() {
                const page = this.page - 1
                let contracts = []
                if (this.contractsPerRegion[this.selectedRegion] == null) return []

                contracts = this.contractsPerRegion[this.selectedRegion]

                if (this.shouldInclude.length > 0)
                    contracts = contracts.filter(contractId => this.shouldInclude.some(typeId => this.contractsPerItem[typeId] != null && this.contractsPerItem[typeId].includes(contractId)))

                return contracts.map(contractId => {
                    const items = this.contractItemsIndexed[contractId] ? this.contractItemsIndexed[contractId] : []
                    return {
                        ...this.contractsIndexed[contractId],
                        items: items.map(item => ({
                            ...item,
                            name: this.itemNames[item.type_id]
                        }))
                    }
                }).slice(page * 100, page * 100 + 100)
            }
        },
        async beforeMount() {
            await this.loadRegions()
        },
        methods: {
            ...mapActions(['loadRegions', 'loadContracts']),
            async getContracts() {
                await this.loadContracts(this.selectedRegion)
            },
            onSearch: debounce(async function () {
                const notExactSearch = this.search.length > 2 ? (await Esi.search(this.search, ['inventory_type'], false)).inventory_type : []
                const contractShouldInclude = this.exactType ? (await Esi.search(this.search, ['inventory_type'], this.exactType)).inventory_type : notExactSearch
                this.searchAutocomplete = notExactSearch.length > 0 ? await Esi.names((notExactSearch)) : []

                this.shouldInclude = contractShouldInclude
            }, 100)
        }
    }
</script>
