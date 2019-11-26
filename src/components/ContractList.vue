<template>
    <table class="contracts-table">
        <tr>
            <th>Contract</th>
            <th>Price</th>
            <th>Location</th>
            <th>Distance</th>
            <th>Expires</th>
            <th>Remark</th>
        </tr>
        <tr v-for="contract of internalContracts" :key="contract.contract_id" class="contracts-table__row">
            <td class="contracts-table__name">
                <router-link :to="`/contract/${contract.contract_id}`">{{contractName(contract)}}</router-link>
            </td>
            <td class="contracts-table__price">{{priceFormat(contract.price)}} ISK</td>
            <td class="contracts-table__location">N/A</td>
            <td class="contracts-table__distance">N/A</td>
            <td class="contracts-table__expires">{{dateTimeFormat(new Date(contract.date_expired))}}</td>
            <td class="contracts-table__remark">{{contract.title}}</td>
        </tr>
    </table>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from "vue-property-decorator"
    import EsiContract from "@/esi/EsiContract"

    @Component
    export default class ContractList extends Vue {
        @Prop() private contracts: Array<EsiContract> = []

        get internalContracts(): Array<EsiContract> {
            return this.contracts
        }

        contractName(contract: EsiContract) {
            if (contract.items == null || contract.items.length === 0) return "Empty contract"
            if (contract.items.length === 1) return contract.items[0].type_id

            return "Multiple items"
        }

        priceFormat(price: number): string {
            return new Intl.NumberFormat("en-US").format(price)
        }

        dateTimeFormat(date: Date): string {
            try {
                return new Intl.DateTimeFormat("en-US", {
                    year: "numeric", month: "numeric", day: "numeric",
                    hour: "numeric", minute: "numeric", second: "numeric",
                    hour12: false,
                    timeZone: "UTC"
                }).format(date)
            } catch (e) {
                return "Invalid date"
            }
        }
    }
</script>

<style scoped>

</style>