/**
This provides methods used for event handling. It's not meant to
be used directly.
@mixin
*/
var Eventful = {
    /**
    Register a handler function to be called whenever this event is fired.
    @param {string} eventName - Name of the event.
    @param {function(Object)} handler - The handler to call.
    */
    on: function(eventName, handler) {},

    /**
    Fire an event, causing all handlers for that event name to run.
    @param {string} eventName - Name of the event.
    @param {Object} eventData - The data provided to each handler.
    */
    fire: function(eventName, eventData) {}
};

/**
phantom mixin
@mixin phantom
*/