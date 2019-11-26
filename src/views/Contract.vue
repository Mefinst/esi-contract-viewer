<template>
    <div class="contract">
        <router-link to="/">&lt;- Back</router-link>
        <div class="contract__cost">Price: {{contract.price}} ISK</div>
        <div class="contract__issuer">Issuer: {{issuer.name}} Corp: {{issuerCorporation.name}}</div>

        <h1>You will get</h1>
        <table class="items-list">
            <tr>
                <th>Name</th>
                <th>Quantity</th>
                <th>Estimated price</th>
            </tr>
            <tr v-for="item of suggestedItems" :key="item.item_id" class="items-list__row">
                <td>{{item.name}}</td>
                <td>{{item.quantity}}</td>
                <td>N/A</td>
            </tr>
        </table>

        <h1>You should provide</h1>
        <table class="items-list">
            <tr>
                <th>Name</th>
                <th>Quantity</th>
                <th>Estimated price</th>
            </tr>
            <tr v-for="item of requestedItems" :key="item.item_id" class="items-list__row">
                <td>{{item.name}}</td>
                <td>{{item.quantity}}</td>
                <td>N/A</td>
            </tr>
        </table>
    </div>
</template>

<script>
    import {mapState} from "vuex";

    export default {
        name: "Contract",
        data() {
            return {}
        },
        components: {},
        computed: {
            ...mapState(['contractsIndexed', 'contractItemsIndexed', 'names']),
            contract() {
                return {
                    ...this.contractsIndexed[this.id],
                    items: this.contractItemsIndexed[this.id].map(item => ({
                        ...item,
                        name: this.names[item.type_id]
                    }))
                }
            },
            issuer() {
                return {id: this.contract.issuer_id, name: this.names[this.contract.issuer_id] }
            },
            issuerCorporation() {
                return {id: this.contract.issuer_corporation_id, name :this.names[this.contract.issuer_corporation_id]}
            },
            suggestedItems() {
                return this.contract.items.filter(item => item.is_included)
            },
            requestedItems() {
                return this.contract.items.filter(item => !item.is_included)
            }
        },
        props: ['id']
    }
</script>

<style scoped>

</style>