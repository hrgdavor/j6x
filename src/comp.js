(function(j6x){

/**
@namespace j6x(comp)
*/

// if the script is loaded again, it will reuse existing j6x.compData
var compData = j6x.compData = j6x.compData || {def:{}, later:{}, __counterSeq:0};
var j6Proto = j6x.prototype;

/**
@function addCompClass
@memberof j6x(comp)
*/
j6x.addCompClass = function(name, supName, initializer){
	if(compData.def[name] || compData.later[name]) console.error('Component with same name already defined '+name);
	if(typeof initializer != 'function') throw new Error('Initializer not a function');
	compData.later[name]  = function(){ return j6x.initComp(name, supName, initializer); };
};

/**
@function initComp
@memberof j6x(comp)
*/
j6x.initComp = function(name, supName, initializer){
	var comp = compData.def[name];

	var superClass = supName == '' ? j6x.Dom:this.getComp(supName);
	if(!comp){
		comp = eval('(function '+name.replace(/[\.\/]/g,'_')+'(){})');
		comp.superClass = superClass;
		j6x.extend( comp, superClass );
	}
	// else: 
	// hapens when reloading component in runtime
	// changes to the component prototype can be applied to the already instantiated components
	initializer(j6x.h, j6x.t, comp.prototype, superClass.prototype, comp, superClass);
	comp.compName = name;

	return (compData.def[name] = comp);
};

/**
@function checkComp
@memberof j6x(comp)
*/
j6x.checkComp = function(name){ return compData.def[name] || compData.later[name]; }

/**
@function getComp
@memberof j6x(comp)
*/
j6x.getComp = function(name, el){ 
	var compDef = compData.def[name];
	if(!compDef && compData.later[name]){
		// initialize the parent component by calling the function in compData.later
		compDef = compData.later[name]();
	}
	if(!compDef) {
		var msg = 'Component not found: '+name;
		console.log(msg,el, name);
		throw new Error(msg);
	}
	return compDef; 
};

/** 
@namespace j6x(comp)

@function makeComp
@memberof j6x(comp)
*/
j6x.addComp = function(parNode, jsx, parent){
	var node = j6x.addJsx(parNode, jsx, parent);
	return j6x.makeComp(node, jsx, parent);
}

/**
 Construct and initialize component, as most code would ecpect the componet
to be live after created 

@function makeComp
@memberof j6x(comp)

*/
j6x.makeComp = function(el, jsx, parent){
	var c = j6x.constructComp(el, jsx, parent);
	if(!c.lazyInit) c.__init();
	return c;
};

/**
Just construct the component without initialization. This is mostly used during 
automatic component template parsing (parseChildren) and initialization is done
 in the second run on all previously created components 

@function constructComp
@memberof j6x(comp)
 */
j6x.constructComp = function(el, jsx, parent, updaters){
	try{

		// sanitize, to allow === null check to work later
		if(!parent) parent = null;

		var compName = el.getAttribute('as') || (jsx.attr ? jsx.attr.as: 'Base');

		el.setAttribute('as', compName);
		el.compRefId = j6x.compData.counterSeq++;

		var compDef = this.getComp(compName, el);
		var c = new compDef();
		c.construct(el, jsx.attr, jsx.directive, parent);
		c.setParent(parent);
		updaters = updaters || (parent ? parent._updaters : []);

		if(el.jsxAttr){
			if(parent) parent.initChildAttr(c, el.jsxAttr, updaters);
			c.initAttr(el.jsxAttr, updaters );
			delete el.jsxAttr;
		}

		if(el.jsxChildren){
			el.jsxChildren = c.initChildrenJsx(el.jsxChildren);
			j6x.insertHtml(el, el.jsxChildren, null, updaters);
			delete el.jsxChildren;
		}
		c.fireEvent('create');
		return c;

	}catch(e){
		// log the component and the node where the error happened
		// this will occur for each parent too as the error is rethrown
		// and error will show up in console for inspection of execution stack
		console.log('error while creating a component ',compName, el, '\ninside the component ', parent,'\n', e);
		throw e;
	}
};





}(j6x));