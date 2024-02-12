class Model {
    #party;
    constructor() {
        this.#party = [];
    }
    CreateParty() {
        const partyid = this.#GeneratePartyId();
        this.#party.push({
            id: partyid,
            time: 0,
            paused: true
        });
        console.log(this.#party);
        return partyid;
    }
    #GeneratePartyId() {
        const partyIds = this.#party.map((party) => party.id);
        //search until a unique id is found
        for(let i=0;i<1000;i++) {
            const id=i;
            if(partyIds.indexOf(id)===-1) {
                return id;
            }
        }
        return -1;
    }
    #GetParty(partyid) {
        //parse the id to integer
        return this.#party.find((party) => party.id === parseInt(partyid));
    }
    SetPartyTime(partyid, time, paused) {
        //time is string, convert it to float
        const party = this.#GetParty(partyid);
        if(party!==undefined) {
            party.time = parseFloat(time);
            party.paused = paused;
            return true;
        }
        return false;
    }
    GetPartyTime(partyid) {
        const party = this.#GetParty(partyid);
        if(party!==undefined) {
            return [party.time, party.paused];
        }
        return false;
    }
    DeleteParty(partyid) {
        const party = this.#GetParty(partyid);
        if(party!==undefined) {
            this.#party = this.#party.filter((p) => p.id !== party.id);
            console.log(this.#party);
            return true;
        }
        console.log(this.#party);
        return false;
    }
}
module.exports = Model;