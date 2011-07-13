class I2A extends ConnecTag.classes.Plugin
    @id = "I2A"

    constructor: () ->
        @initialized = false

    track: (settings, instances) ->
        instance = instances[0]    # There should only be one
        @executeCommands(instance.commands, instance.id)
        @helpers.getScript(settings.path) if typeof pixel isnt "function"

    methods: (() ->
        m = {}
        properties = [
            'pageAction'
            'price'
            'sku'
            'order_code'
            'user_defined1'
            'user_defined2'
            'user_defined3'
            'user_defined4'
            'currency_id'
            'ic_bu'
            'ic_bc'
            'ic_ch'
            'ic_nso'
            'altid'
            'ic_cat'
            'ic_type'
        ]

        getPropertyHandler = (property) ->
            return (value) ->
                value = "'#{value}'" if typeof value is "string"

                # Evaluate in the global scope
                new Function("#{property} = #{value}")()

        # Build methods
        for property in properties
            m[property] = getPropertyHandler(property)

        m.pixel_conversion = (pageAction) ->
            window.pixel_conversion(pageAction)

        m
    )()

ConnecTag.classes.plugins.I2A = I2A
