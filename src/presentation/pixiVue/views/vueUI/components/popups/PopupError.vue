<script setup>
	import TextField from '../TextField.vue'
	const emit = defineEmits(['close'])

	const props =  defineProps({
		messageText: String,
		buttonText: String,
	})
</script>

<template>
	<div>
		<div class="body-background"> </div>
		<TextField
			class="message-text"
			:maximalWidth="250"
			:maximalHeight="40"
			:layoutX="'center'"
			:layoutY="'middle'">
			{{ messageText }}
		</TextField>
		<TextField
			@click="emit('close')"
			class="button"
			:maximalWidth="80"
			:maximalHeight="40"
			:layoutX="'center'"
			:layoutY="'middle'">
			{{ buttonText }}
		</TextField>
	</div>
</template>

<style scoped>
.body-background{
	width: 300px;
	height: 200px;
	border-radius: 15px;
	background: -webkit-gradient(linear, left bottom, left top, from(rgba(0, 0, 0, .8)), to(rgba(41, 41, 41, .8)));
	background: linear-gradient(to top, rgba(0, 0, 0, .8) 0%, rgba(41, 41, 41, .8) 100%);
	border-top: 1px solid #515253;
	-webkit-backdrop-filter: blur(3px);
	backdrop-filter: blur(3px);
}

.message-text {
	width: 250px;
	height: 40px;
	left: 25px;
	top: 66px;
	text-align: center;
}

.button {
	position: absolute;
	left: 105px;
	top: 125px;
	width: 80px;
	height: 40px;
	background:#b3b3b3;
	border-radius: 10px;
	color: black;
}

.button:hover {
	background:#00B1A9;
	cursor: pointer;
}
</style>