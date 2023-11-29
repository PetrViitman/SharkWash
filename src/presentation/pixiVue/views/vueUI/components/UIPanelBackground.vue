<template>
	<div class="blurred-background"></div>
</template>

<style scoped>
.blurred-background{
	width: 600px;
	height: 70px;
	-webkit-backdrop-filter: blur(3px);
	backdrop-filter: blur(3px);
	background: -webkit-gradient(linear, left bottom, left top, from(rgba(0, 0, 0, .8)), to(rgba(41, 41, 41, .8)));
	background: linear-gradient(to top, rgba(0, 0, 0, .8) 0%, rgba(41, 41, 41, .8) 100%);
	border-top: 1px solid #515253;
}
</style>
