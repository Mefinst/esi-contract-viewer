<template>
    <div class="home">
        <div class="filter-panel">
            <label>
                <span>Region</span>
                <select v-model="selectedRegion">
                    <option v-for="region of regions.values()" :key="region.region_id" :value="region.region_id">
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
                <input type="text" v-model="search" @keyup="onSearchInput" list="searchTypes">
                <datalist id="searchTypes">
                    <option v-for="item of searchAutocomplete" :key="item.id" :value="item.id">{{item.name}}</option>
                </datalist>
            </label>
            <button v-on:click="getContracts">Get Contracts</button>
        </div>
        <ContractList :contracts="contracts.has(selectedRegion) ? Array.from(contracts.get(selectedRegion).values()) : null"/>
    </div>
</template>

<script lang="js">
    // @ is an alias to /src
    import ContractList from "@/components/ContractList";
    import Esi from "@/esi/Esi";
    import {mapActions, mapState} from "vuex";

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
                exactType: null
            }
        },
        computed: {
            ...mapState(['regions', 'contracts']),
            filteredContracts() {
                const regionIndex = this.contracts.get(this.selectedRegion)
                if(regionIndex == null) return []
                return Array.from(regionIndex.values()).filter(it => it.type === 'item_exchange')
            }
        },
        async beforeMount() {
            await this.loadRegions()
        },
        methods: {
            ...mapActions(['loadRegions', 'loadContracts']),

            async onSearchInput() {
                //TODO: add debounce
                const searchResult = (await Esi.search(this.search, ['inventory_type'], false)).inventory_type
                this.exactType = searchResult.length === 1 ? searchResult[0].id : null
                this.searchAutocomplete = await Esi.names(searchResult)
                if (this.exactType == null)
                    this.exactType = (await Esi.search(this.search, ['inventory_type'], false)).inventory_type[0]

            },
            async getContracts() {
                await this.loadContracts(this.selectedRegion)
            }
        }
    }
</script>
