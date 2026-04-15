class Model {
    // party 
    #party;
    constructor() {
        this.#party = [];
    }
    CreateParty(file) {
        const partyid = this.#GeneratePartyId();
        this.#party.push({
            id: partyid,
            time: 0,
            paused: true,
            lastsync: Date.now(),
            url: file,
        });
        return partyid;
    }
    #GeneratePartyId() {
        const partyIds = this.#party.map((party) => party.id);
        //search until a unique id is found
        for(let i=0;i<1000;i++) {
            let id="";
            for(let j=0;j<5;j++) {
                id+=String.fromCharCode(Math.floor(Math.random()*26)+97);
            }
            if(partyIds.indexOf(id)===-1) {
                return id;
            }
        }
        return -1;
    }
    #GetParty(partyid) {
        //parse the id to integer
        return this.#party.find((party) => party.id === partyid);
    }
    SetPartyTime(partyid, time, paused) {
        //time is string, convert it to float
        for(let i=0;i<this.#party.length;i++) {
            if(this.#party[i].lastsync+1000*60*60*1<Date.now()) {  //1 hour
                this.DeleteParty(this.#party[i].id);
            }
        }
        const party = this.#GetParty(partyid);
        if(party!==undefined) {
            party.time = parseFloat(time);
            party.paused = paused;
            console.log(party.lastsync);
            party.lastsync = Date.now();
            return true;
        }
        return false;
    }
    GetPartyTime(partyid, file) {
        for(let i=0;i<this.#party.length;i++) {
            if(this.#party[i].lastsync+1000*60*60*1<Date.now()) {  //1 hour
                this.DeleteParty(this.#party[i].id);
            }
        }
        const party = this.#GetParty(partyid);
        if(party!==undefined) {
            console.log(file, party.url)
            if(party.url!==file) {
                return false;
            }
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