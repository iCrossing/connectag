class Munchkin extends ConnecTag.classes.Plugin
    @id = "Munchkin"

    constructor: () ->
        @initialized = false

    initialize: (settings, callback) ->
        @helpers.getScript("#{window.location.protocol}//munchkin.marketo.net/munchkin.js", callback)

    track: (settings, instances) ->
        if not @initialized
            @initialize settings, ()  =>
                @initialized = true
                @track(settings, instances)

            return

        instance = instances[0]    # There should only be one
        @executeCommands(instance.commands, instance.id)

    methods:
        init: (accountId) ->
            window.Munchkin.init(accountId)

ConnecTag.classes.plugins.Munchkin = Munchkin
