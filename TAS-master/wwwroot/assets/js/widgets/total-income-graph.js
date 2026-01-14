'use strict';
document.addEventListener('DOMContentLoaded', function () {
	setTimeout(function () {
		var options8 = {
			chart: {
				height: 320,
				type: 'donut'
			},
			series: [objectAgent.total, objectFarm.total],
			colors: [objectAgent.color, objectFarm.color],
			labels: [objectAgent.label, objectFarm.label],	
			fill: {
				opacity: [1, 1, 1, 0.3]
			},
			legend: {
				show: false
			},
			plotOptions: {
				pie: {
					donut: {
						size: '65%',
						labels: {
							show: true,
							name: {
								show: true
							},
							value: {
								show: true
							}
						}
					}
				}
			},
			dataLabels: {
				enabled: false
			},
			responsive: [
				{
					breakpoint: 575,
					options: {
						chart: {
							height: 250
						},
						plotOptions: {
							pie: {
								donut: {
									size: '65%',
									labels: {
										show: false
									}
								}
							}
						}
					}
				}
			]
		};
		var chart = new ApexCharts(document.querySelector('#total-income-graph'), options8);
		chart.render();
	}, 500);
});
