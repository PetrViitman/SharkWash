<script setup>
	import TextField from './TextField.vue'
	const props = defineProps({
		FPS: Number,
	})
</script>

<template scoped>
    <TextField
        class="text-field"
        :layoutX="'left'"
        :layoutY="'middle'"
        :maximalWidth = "100"
        :maximalHeight = "30">
        {{ 'FPS: ' + props.FPS }}
    </TextField>
</template>

<style scoped>
	.text-field{
		opacity: 0.5;
        color: white;
        position: absolute;
        left: 5px;
	}
</style>
