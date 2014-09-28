/**
a global var with a @see 
@see something or other
*/
var seeableVar = "something";

/**
 * Both of these will link to the bar function.
 * @see {@link seebar}
 * @see bar
 */
function seefoo() {}

// Use the inline {@link} tag to include a link within a free-form description.
/**
 * @see {@link seefoo} for further information.
 * @see {@link http://github.com|GitHub}
 */
function seebar() {}
