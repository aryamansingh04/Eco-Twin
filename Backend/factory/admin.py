from django.contrib import admin

from .models import (
    Factory,
    Zone,
    Machine,
    Connection,
    EnergyReading,
    MachineTelemetry,
    Product,
    MachineCapability,
    ProductRequirement
)


admin.site.register(Factory)
admin.site.register(Zone)
admin.site.register(Machine)
admin.site.register(Connection)
admin.site.register(EnergyReading)
admin.site.register(MachineTelemetry)
admin.site.register(Product)
admin.site.register(MachineCapability)
admin.site.register(ProductRequirement)