<script setup>
	import TextField from '../TextField.vue'
</script>

<template>
	<div class="body">
		<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" version="1.1" x="0" y="0" viewBox="0 0 300 300" xml:space="preserve"><g class="svg-group enable-pointer-events"><g id="autoplay-idle"><linearGradient id="SVGID_00000013890713939924517410000012163221973519894410_" x1="-2985.817" x2="-2657.354" y1="-4896.724" y2="-4896.724" gradientTransform="rotate(95.258 -3639.152 -1016.647) scale(1.00001)" gradientUnits="userSpaceOnUse"><stop offset="0.162" stop-color="#474747"></stop><stop offset="0.462" stop-color="#383838"></stop><stop offset="1" stop-color="#141414"></stop></linearGradient><circle cx="150" cy="150" r="149.5"
			fill="url(#SVGID_00000013890713939924517410000012163221973519894410_)"></circle><linearGradient id="SVGID_00000008870057243538626970000004548477235010329005_" x1="-7289.62" x2="-6980.939" y1="4954.616" y2="4954.616" gradientTransform="rotate(-91.208 -5846.359 -1015.712) scale(1.00002)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#474747"></stop><stop offset="0.109" stop-color="#3D3D3D"></stop><stop offset="0.456" stop-color="#222"></stop><stop offset="0.764" stop-color="#121212"></stop><stop offset="1" stop-color="#0C0C0C"></stop></linearGradient><circle cx="150" cy="150" r="140.5"
			fill="url(#SVGID_00000008870057243538626970000004548477235010329005_)"></circle>
		</g><g class="spin-number-g "><text class="spin-number-text" x="50%" y="50%" text-anchor="middle"></text></g></g>
		</svg>
		<TextField
			class="text-field"
			:layoutX="'center'"
			:layoutY="'middle'"
			:maximalWidth = "50"
			:maximalHeight = "50">
			<slot></slot>
		</TextField>
	</div>
</template>

<style scoped>
.body{
	color: #00B1A9;
	width: 50px;
	height: 50px;
}
.body:hover {
	color: #00dacf;
	cursor: pointer;
}
</style>
