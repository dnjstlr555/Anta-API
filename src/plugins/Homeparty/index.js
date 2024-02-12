const PartyModel = require("./model");

module.exports = (model) => {
    const implement = {
        name: "Homeparty",
        callpath: "party",
        init: () => {
            model.RegisterCustomModel("party", new PartyModel());
        },
        run: async (req, res, args) => {
            /*
            TODO : 1. store video's path and measure the buffering time, and then sync the video's time with the time of the host.
            2. Also change the method to post and use the body to send the data. (It's not a good idea to send the time in the url.)
            3. add Desc to plugin system.

            Homeparty plugin is a plugin that syncs the video with two people.
            There will be a host and a guest.
            The host will be the one who calls this plugin continuously while watching a video.
            The guest will be the one who receives(call and get responses) the call continuously.

            Process:
            1. The host calls the plugin with the video's path.
            2. The plugin will create a room and return the room id. (?party=create)
            3. The host will call the plugin with the room id and the current time of the video. (?party=sync&id=id&time=currenttime&paused=true/false)
            4. The plugin will save the time 
            5. The guest will call the plugin with the room id. (?party=get&id=id)
            6. The plugin will return the time of the host.

            Frontend Process:
            1. When host calls the plugin, the frontend will save the room id.
            2. Since the room id is saved, the frontend will call the plugin with the room id and the current time of the video every 1 second until the video closed.
            3. When the guest calls the plugin, the frontend will call the plugin with the room id every 0.5 second and sync the video's time with the time of the host. (There could be a delay for +- 0.5 second but it's acceptable.)
            4. When the video is closed, the frontend will call the plugin with the room id and the current time of the video with the action "close". (?party="close")
            5. The plugin will delete the room and return the result.
            */
            const partyModel=model.GetCustomModel("party");
            const filePath = await model.ConvertPath(decodeURIComponent(req.path));
            if(filePath==null) {
                return false;
            }
            const action = req.query.party;
            switch(action) {
                case "create":
                    const id = partyModel.CreateParty();
                    if(id===-1) {
                        return false;
                    }
                    res.send(id.toString());
                    return true;
                case "sync":
                    if(req.query.time==undefined || req.query.id==undefined || req.query.paused==undefined) {
                        return false;
                    }
                    partyModel.SetPartyTime(req.query.id, req.query.time, req.query.paused==="true");
                    res.send(true.toString());
                    return true;
                case "get":
                    if(req.query.id==undefined) {
                        return false;
                    }
                    res.json(partyModel.GetPartyTime(req.query.id));
                    return true;
                case "close":
                    if(req.query.id==undefined) {
                        return false;
                    }
                    const result=partyModel.DeleteParty(req.query.id);
                    if(!result) {
                        return false;
                    }
                    res.send(true.toString());
                    return true;
            }
            return false;
        },
        test: () => {
            return model!==undefined;
        }
    }
    return implement;
}