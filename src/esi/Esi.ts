import EsiRegion from '@/esi/EsiRegion'
import EsiContract from '@/esi/EsiContract'
import EsiContractItem from '@/esi/EsiContractItem'

export default class Esi {
    public static async getRegions(): Promise<Array<number>> {
        const response = await Esi.request('/v1/universe/regions/')
        if (Array.isArray(response))
            return response as Array<number>

        throw new Error('[ESI Api] Failed to obtain region list')
    }

    public static async getRegion(id: number): Promise<EsiRegion> {
        return await Esi.request(`/v1/universe/regions/${id}/`)
    }

    public static async getPublicContracts(regionId: number, page: number): Promise<Array<EsiContract>> {
        const response = await Esi.request(`/v1/contracts/public/${regionId}?page=${page}`)

        if (Array.isArray(response))
            return response as Array<EsiContract>

        throw new Error(`[ESI Api] Failed to obtain contracts region=${regionId} page=${page}`)
    }

    public static async getPublicContractsAll(regionId: number): Promise<Array<EsiContract>> {
        let pageIsFull = false
        let page = 1
        let contracts: Array<EsiContract> = []

        do {
            const response = await Esi.getPublicContracts(regionId, page)
            pageIsFull = response.length === 1000
            page++

            contracts = contracts.concat(response)
        } while (pageIsFull)

        return contracts
    }

    public static async getContractItems(contractId: number): Promise<Array<EsiContractItem>> {
        return await Esi.request(`/v1/contracts/public/items/${contractId}/`)
    }


    public static async search(text: string, categories: Array<string> = ['inventory_type'], strict: boolean = false) {
        return await Esi.request(`/v2/search?search=${text}&categories=${categories.join(',')}&strict=${strict}`)
    }

    public static async names(ids: Array<number>): Promise<Array<{ id: number, name: string, category: string }>> {
        return await Esi.request('/v3/universe/names/', 'POST', ids)
    }

    private static RootUrl = 'https://esi.evetech.net'
    private static retryTimeout = 10000

    private static queueTimeout = 100
    private static requestsLimit = 100
    private static requestsCount = 0


    private static async request(url: string, method: string = 'GET', parameters: any = null): Promise<any> {
        return await new Promise(async resolve => {
            while (Esi.requestsCount > Esi.requestsLimit)
                await (async () => new Promise(resolve1 => {
                    setTimeout(resolve1, Esi.queueTimeout)
                }))()

            Esi.requestsCount++

            const response = await Esi.actuallyRequest(url, method, parameters)

            Esi.requestsCount--

            resolve(response)
        })
    }


    private static async actuallyRequest(url: string, method: string = 'GET', parameters: any = null) {
        let response = null
        try {
            response = await fetch(Esi.RootUrl + url, {
                method,
                body: method !== 'GET' ? JSON.stringify(parameters) : null
            })
        }
        catch (e) {
            return null
        }

        switch (response.status) {
            case 200:
            case 304:
                return await response.json()
            case 204:
                await response.text()
                return null
            case 400:
            case 404:
                await response.text()
                return undefined
            case 420:
                await response.text()
                return new Promise(resolve => setTimeout(() => Esi.request(url, method, parameters).then(resolve), Esi.retryTimeout))
        }

        await response.text()

        throw new Error(`[ESI Api] unexpected response status ${response.status} ${JSON.stringify({
            url,
            parameters
        })}`)
    }
}