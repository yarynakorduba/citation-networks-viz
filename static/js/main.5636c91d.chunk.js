(this["webpackJsonpcitation-networks"]=this["webpackJsonpcitation-networks"]||[]).push([[0],{145:function(t,e,n){},146:function(t,e,n){},147:function(t,e,n){},148:function(t,e,n){"use strict";n.r(e);var c=n(0),a=n.n(c),r=n(57),i=n.n(r),o=n(38),s=n(2),u=n(13),l=n(60),j=n(7),b=n(154),f=n(151),h=n(8),d=n.n(h),O=n(18),p=n(22),m=n(5),v=n(156),x=n(150),g=n(58),k=n(155),N=n(157),y=n(59),C=function(t,e){return function(){var n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:1e3,c=arguments.length>1&&void 0!==arguments[1]?arguments[1]:1e3,a="x"===e?n:c;return Math.max(20,Math.min(a-20,t[e]))}},w=function(t,e,n,c){return function(){e.attr("x1",(function(t){return C(t.source,"x")(n,c)})).attr("y1",(function(t){return C(t.source,"y")(n,c)})).attr("x2",(function(t){return C(t.target,"x")(n,c)})).attr("y2",(function(t){return C(t.target,"y")(n,c)})),t.attr("transform",(function(t){return"translate("+C(t,"x")(n,c)+","+C(t,"y")(n,c)+")"}))}},S=function(t){return[function(e){return e.append(t)},function(t){return t},function(t){return t.remove()}]},I=function(t,e){return m.i().domain(t).range(e)},M=n(159),E=function(t){var e=Object(c.useState)([]),n=Object(j.a)(e,2),a=n[0],r=n[1],i=Object(c.useCallback)(Object(p.a)(d.a.mark((function e(){var n;return d.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,m.h(t);case 2:n=e.sent,r(n);case 4:case"end":return e.stop()}}),e)}))),[t]);return Object(c.useEffect)((function(){i()}),[i]),[a,r]},B=function(t,e){var n=Object(c.useState)(""),a=Object(j.a)(n,2),r=a[0],i=a[1],o=Object(M.a)(r,400),s=Object(j.a)(o,1)[0],u=Object(c.useState)([]),l=Object(j.a)(u,2),f=l[0],h=l[1],d=Object(c.useMemo)((function(){return Object(b.a)(s)}),[s]);return Object(c.useEffect)((function(){if(s){var n=t.map(e(d));h(n)}else h(t)}),[t,d,s,h,e]),Object(c.useEffect)((function(){f&&f.map((function(t){var e=t.id,n=t.isHighlighted,c=document.getElementById(e);c&&c.setAttribute("stroke",n?"blue":"none")}))}),[f]),{searchInput:r,setSearchInput:i}},A=(n(56),n(1)),G=1e3,F=500,D=["#ff4a4a","#ad0303"],L="arrowhead",T=function(t){return Math.sqrt((10+100*t.citedBy)/Math.PI)},H=function(t){return T(t)+5};function P(t){var e,n,a,r=t.data,i=Object(c.useState)([]),o=Object(j.a)(i,2),s=o[0],u=o[1],l=Object(c.useState)([]),b=Object(j.a)(l,2),f=b[0],h=b[1],C=Object(c.useMemo)((function(){return m.a(r,(function(t){return t.citedBy}))}),[r]),M=m.l("svg#citationGraph");a=L,Object(c.useEffect)((function(){m.l("svg").append("defs").append("marker").attr("id",a).attr("refX",9.5).attr("refY",3).attr("orient","auto").attr("markerWidth",12).attr("markerHeight",9).attr("xoverflow","visible").append("svg:path").attr("d","M1.25 1.08359L7.33542 3L1.25 4.91641L1.25 1.08359Z").attr("fill","#999").style("stroke","none")}),[a]);var E=Object(c.useRef)(null),B=Object(c.useCallback)(Object(p.a)(d.a.mark((function t(){var e,n,c;return d.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:r&&(e=r,n=Object(v.a)(Object(x.a)("id"),e),c=Object(g.a)((function(t,e){var c=e.title,a=e.citations,r=Object(k.a)(Object(N.a)((function(t){return{source:c,target:t.title}})),Object(y.a)((function(t){return n[t.title]})))(a);return[].concat(Object(O.a)(t),Object(O.a)(r))}),[],r),h(e),u(c));case 1:case"end":return t.stop()}}),t)}))),[h,u,r]);Object(c.useEffect)((function(){B()}),[B]);var P=(e=M.selectAll("line").data(s)).join.apply(e,Object(O.a)(S("line"))).attr("stroke","#999").attr("stroke-opacity",.6).attr("stroke-width",2).attr("marker-end",(function(){return"url(#".concat(L,")")})).lower(),_=(n=M.selectAll("circle").data(f)).join.apply(n,Object(O.a)(S("circle"))).attr("r",T).attr("id",(function(t){return t.id})).attr("stroke","transparent").attr("stroke-width",3).style("fill",(function(t){return I(C,D)(t.citedBy)})).on("click",(function(t,e){console.log(e)}));return Object(c.useEffect)((function(){E.current=m.g().alphaDecay(.03).force("charge",m.e().strength(0)).force("center",m.b().x(500).y(250)).force("link",m.d().id(Object(x.a)("id"))).force("collision",m.c(H)),E.current.nodes(f).on("tick",w(_,P,G,F)),E.current.force("link").links(s)}),[f,s,_,P]),Object(c.useEffect)((function(){var t=setTimeout((function(){return E.current.stop()}),5e3);return function(){return clearTimeout(t)}}),[]),Object(A.jsx)("svg",{id:"citationGraph",width:G,height:F,viewBox:"".concat(-500," ").concat(-250," ").concat(-1e3," ").concat(-500)})}var _=Object(c.memo)(P),V=(n(145),function(t){var e=t.className,n=t.value,c=t.setValue;return Object(A.jsxs)("div",{className:"Search ".concat(e),children:[Object(A.jsx)("input",{className:"Search__input",placeholder:"search by name",value:n,onChange:function(t){var e=t.target.value;c(e)}}),Object(A.jsx)("button",{className:"Search__button",children:"Find Character"})]})}),J=Object(c.memo)(V),R=["title"];var Y=function(){var t=E("citeData.json"),e=Object(j.a)(t,1)[0],n=Object(c.useState)(""),a=Object(j.a)(n,2),r=a[0],i=a[1];Object(c.useEffect)((function(){var t=e.map((function(t){var e=t.title,n=Object(l.a)(t,R);return Object(u.a)(Object(u.a)({},n),{},{id:e,title:e})}));i(t)}),[i,e]);var o=B(r,(function(t){return function(e){var n=e.id,c=e.title,a=e.authors.map((function(t){var e=t.forename,n=t.surname;return"".concat(e," ").concat(n)})).join(" "),r=Object(b.a)("".concat(c," ").concat(a));return{id:n,isHighlighted:Object(f.a)(t,r)}}})),s=o.searchInput,h=o.setSearchInput;return Object(A.jsxs)("div",{children:[Object(A.jsx)("div",{className:"coauthorship-filter-container",children:Object(A.jsx)(J,{className:"coauthorship-search",value:s,setValue:h})}),Object(A.jsx)("button",{children:"Test"}),Object(A.jsx)(_,{data:r})]})},q=n(152),z=n(153),K=n(158),W=n(9),X=1e3,Z=800,Q=["#CCCCCC","blue"],U=["#ff4a4a","#ad0303"],$=function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[2,10];return function(n){return m.i().domain(t).range(e)(n)}};function tt(t){var e,n,a=t.data,r=t.setSelectedNode,i=m.l("svg#coauthorshipGraph"),o=Object(c.useState)([]),s=Object(j.a)(o,2),l=s[0],b=s[1],f=Object(c.useState)([]),h=Object(j.a)(f,2),v=h[0],g=h[1],y=Object(c.useMemo)((function(){return m.a(Object(q.a)(Object(K.a)({},["coauthorships"],a)),(function(t){return(t.papers||[]).length}))}),[a]),C=Object(c.useMemo)((function(){return m.a(Object(q.a)(Object(K.a)({},["authors"],a)),(function(t){return t.papersCount}))}),[a]),M=Object(c.useRef)(null),E=Object(c.useCallback)(Object(p.a)(d.a.mark((function t(){var e,n;return d.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:a&&Object(W.a)(a).length&&(e=Object(k.a)((function(t){return t}),(function(t){return Object(q.a)(t)}),Object(z.a)((function(t,e){return Object(u.a)(Object(u.a)({},t),{},{id:e})})))(a.authors),n=Object(k.a)(Object(N.a)((function(t){return Object(u.a)(Object(u.a)({},t),{},{source:t.firstAuthor,target:t.secondAuthor})})),(function(t){return Object(q.a)(t)}))(a.coauthorships),g(e),b(n));case 1:case"end":return t.stop()}}),t)}))),[g,b,a]);Object(c.useEffect)((function(){E()}),[E]);var B=(e=i.selectAll("line").data(l)).join.apply(e,Object(O.a)(S("line"))).style("stroke",(function(t){return I(y,Q)((t.papers||[]).length)})).attr("stroke-width",(function(t){return m.j(y,[1,8])((t.papers||[]).length)})).lower(),G=(n=i.selectAll("circle").data(v)).join.apply(n,Object(O.a)(S("circle"))).attr("r",(function(t){return $(C,[2,9])(t.papersCount)})).attr("id",(function(t){return t.id})).attr("stroke","transparent").attr("stroke-width",3).style("fill",(function(t){return I(C,U)(t.papersCount)})).on("click",(function(t,e){var n=e.forename,c=e.surname,a=e.papers;a=a.map((function(t){var e=t.authors,n=t.title;return{authorNames:e.map((function(t){return"".concat(t.forename,". ").concat(t.surname)})),title:n}})),r({fullName:"".concat(n,". ").concat(c),papers:a})}));return Object(c.useEffect)((function(){M.current=m.g().alphaDecay(.03).force("charge",m.e().distanceMin(3).distanceMax(50).strength(-50)).force("center",m.b().x(500).y(400)).force("link",m.d().id(Object(x.a)("id")).distance((function(t){return t.source.papersCount+t.target.papersCount<=4?3:m.i(y,[4,50])(t.source.papersCount+t.target.papersCount)})).strength(.5)).force("collision",m.c((function(t){return function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[2,10];return function(n){return $(t,e)(n)>4?3*$(t,e)(n):$(t,e)(n)}}(C,[3,9])(t.papersCount)})).strength(.25)).force("r",m.f((function(t){return function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[280,210,140,70,1],n=Object(j.a)(t,2),c=n[0],a=n[1],r=(a-c)/4,i=[c,c+r,c+2*r,c+3*r,a];return m.k().range(e).domain(i)}(C)(t.papersCount)})).x(500).y(400).strength(1)),M.current.nodes(v).on("tick",w(G,B,X,Z)),M.current.force("link").links(l)}),[v,l,i,y,C,r,G,B]),Object(A.jsx)("svg",{className:"coauthorship-graph",id:"coauthorshipGraph",width:X,height:Z,viewBox:"".concat(-500," ").concat(-400," ").concat(-1e3," ").concat(-800)})}var et=Object(c.memo)(tt);var nt=function(){var t=E("authorData.json"),e=Object(j.a)(t,1)[0],n=Object(c.useState)(void 0),a=Object(j.a)(n,2),r=a[0],i=a[1],o=Object(c.useMemo)((function(){return Object(k.a)((function(t){return t}),(function(t){return Object(q.a)(t)}),Object(z.a)((function(t,e){return Object(u.a)(Object(u.a)({},t),{},{id:e})})))(e.authors)}),[e]),s=Object(c.useCallback)((function(t){return function(e){var n=e.id,c=e.forename,a=e.surname,r=Object(b.a)("".concat(c," ").concat(a));return{id:n,isHighlighted:Object(f.a)(t,r)}}}),[]),l=B(o,s),h=l.searchInput,d=l.setSearchInput;return Object(A.jsxs)("div",{className:"coauthorship-graph-container",children:[Object(A.jsxs)("div",{className:"coauthorship-results",children:[Object(A.jsx)("div",{className:"coauthorship-filter-container",children:Object(A.jsx)(J,{className:"coauthorship-search",value:h,setValue:d})}),r?Object(A.jsxs)("div",{className:"author-info",children:[Object(A.jsx)("div",{className:"author-info-title",children:r.fullName}),Object(A.jsx)("div",{className:"author-info-list",children:r.papers.map((function(t,e){return Object(A.jsxs)("div",{className:"author-info-list-item",children:[Object(A.jsx)("div",{className:"author-info-list-item-title",children:t.title}),Object(A.jsx)("div",{className:"author-info-list-item-subtitle",children:t.authorNames.join(", ")})]},e)}))})]}):Object(A.jsxs)("div",{className:"item",children:[Object(A.jsx)("div",{className:"item-title",children:"No coauthorship node selected."}),Object(A.jsx)("div",{className:"item-subtitle",children:"Click on a red node to view more information."})]})]}),Object(A.jsx)(et,{data:e,setSelectedNode:i})]})};var ct=function(t){return Object(A.jsx)(o.b,{to:t.to,children:Object(A.jsxs)("div",{className:"card",children:[Object(A.jsx)("div",{className:"card-img",style:{backgroundImage:"url(".concat(t.bannerImage,")")}}),Object(A.jsxs)("div",{className:"card-body",children:[Object(A.jsx)("div",{className:"card-title",children:t.title}),Object(A.jsx)("div",{className:"card-subtitle",children:t.subtitle})]})]})})};var at=function(){return Object(A.jsxs)("div",{className:"card-container",children:[Object(A.jsx)(ct,{title:"Citation graph",subtitle:"Graph displaying number of citations",bannerImage:"citationGraphBanner.png",to:"/citation"}),Object(A.jsx)(ct,{title:"Co-authorship graph",subtitle:"Graph display number of coauthorships",bannerImage:"coAuthorshipGraphBanner.png",to:"/coauthorship"})]})};var rt=function(){return Object(A.jsxs)("nav",{className:"navbar",children:[Object(A.jsx)("span",{className:"navbar-title",children:" Publications viz "}),Object(A.jsx)("span",{className:"navbar-subtitle",children:" Nika \u010ci\u0107, Yaryna Korduba "})]})};n(146);var it=function(){return Object(A.jsxs)(A.Fragment,{children:[Object(A.jsx)("main",{className:"app",children:Object(A.jsx)(o.a,{children:Object(A.jsxs)(s.c,{children:[Object(A.jsx)(s.a,{path:"/",element:Object(A.jsx)(at,{})}),Object(A.jsx)(s.a,{path:"/citation/",element:Object(A.jsx)(Y,{})}),Object(A.jsx)(s.a,{path:"/coauthorship/",element:Object(A.jsx)(nt,{})})]})})}),Object(A.jsx)(rt,{})]})},ot=(n(147),function(t){t&&t instanceof Function&&n.e(3).then(n.bind(null,160)).then((function(e){var n=e.getCLS,c=e.getFID,a=e.getFCP,r=e.getLCP,i=e.getTTFB;n(t),c(t),a(t),r(t),i(t)}))});i.a.render(Object(A.jsx)(a.a.StrictMode,{children:Object(A.jsx)(it,{})}),document.getElementById("root")),ot()},56:function(t,e,n){}},[[148,1,2]]]);
//# sourceMappingURL=main.5636c91d.chunk.js.map