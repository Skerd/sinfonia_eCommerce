import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import type {CustomerAddress} from "armonia/src/modules/eCommerce/api/eCommerce/private/customerAddress/customerAddress.dto.ts";
import {IconMapPin, IconPhone, IconStar} from "@tabler/icons-react";
import CustomerAddressSheetView from "@eCommerceModule/clients/panel/private/customerAddresses/center/sheetView/customerAddressSheetView.tsx";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import SetDefaultCustomerAddress from "@eCommerceModule/clients/panel/private/customerAddresses/center/actions/setDefaultCustomerAddress.tsx";
import SetDefaultCustomerAddressDialog from "@eCommerceModule/clients/panel/private/customerAddresses/center/dialogs/setDefaultCustomerAddressDialog.tsx";
import DisplayRow from "@coreModule/components/custom/displayValue/displayRow.tsx";
import EntityCard from "@coreModule/components/custom/systemCards/entityCard.tsx";
import type {WithAxiosLifecycleRef} from "@coreModule/helpers/hocs/withAxios.tsx";
import type {RefObject} from "react";

const LIST_BASE = "/eCommerce/customeraddresses";

function customerAddressEditPath(entity: CustomerAddress) {
    const params = new URLSearchParams();
    params.set("customerAddressId", entity._id);
    if (entity.firstName) params.set("customerAddressTitle", encodeURIComponent(String(entity.firstName)));
    return `${LIST_BASE}/edit?${params.toString()}`;
}

function addressTitle(entity: CustomerAddress) {
    return [entity.firstName, entity.lastName].filter(Boolean).join(" ");
}

type CustomerAddressCardProps = WithLanguageType & {
    entity: CustomerAddress;
    fetchId?: string;
    hideActions?: boolean;
    onDelete?: (deleted?: CustomerAddress, response?: DeletedData) => void;
    onRestore?: () => void;
    sheetOnly?: boolean;
    onDefaultChanged?: (addressId: string) => void;
    innerRef?: RefObject<WithAxiosLifecycleRef<CustomerAddress> | null>;
};

function CustomerAddressCard({
    entity,
    resolveLanguageKey,
    fetchId,
    hideActions = false,
    onDelete,
    onRestore,
    sheetOnly = false,
    onDefaultChanged,
    innerRef,
}: CustomerAddressCardProps) {
    return (
        <EntityCard
            resource="customerAddresses"
            entity={entity}
            fetchId={fetchId}
            singleUrl="/api/eCommerce/customerAddress/single"
            onDelete={onDelete}
            onRestore={onRestore}
            hideActions={hideActions}
            sheetOnly={sheetOnly}
            editPath={customerAddressEditPath}
            Sheet={CustomerAddressSheetView}
            sheetEntityProp="entity"
            deleteUrl="/api/eCommerce/customerAddress"
            restoreUrl="/api/eCommerce/customerAddress/restore"
            failedTitle=""
            failedDescription=""
            titlePath="firstName"
            innerRef={innerRef}
            sheetProps={({entity: row, setEntity}) => ({
                fetchId,
                onDefaultChanged: (addressId: string) => {
                    setEntity({...row, isDefault: true});
                    onDefaultChanged?.(addressId);
                },
                onSheetRowPatched: (patched: Partial<CustomerAddress>) => {
                    setEntity({...row, ...patched});
                },
            })}
            extraDialogs={({action, setAction, entity: row, setEntity}) => (
                <>
                    {action === "setDefaultCustomerAddress" && (
                        <SetDefaultCustomerAddressDialog
                            open
                            onClose={() => setAction("")}
                            entity={row}
                            onSuccess={() => {
                                setEntity({...row, isDefault: true});
                                onDefaultChanged?.(row._id);
                            }}
                        />
                    )}
                </>
            )}
        >
            {({entity: row, setAction}) => (
                <>
                    <EntityCard.Header titlePath="firstName" title={addressTitle(row)}>
                        <SetDefaultCustomerAddress entity={row} onAction={setAction} />
                    </EntityCard.Header>
                    <EntityCard.Body>
                        <DisplayRow
                            icon={IconMapPin}
                            label={resolveLanguageKey("street")}
                            tooltip={resolveLanguageKey("street")}
                            path="street"
                            value={row.street}
                        />
                        <DisplayRow
                            icon={IconMapPin}
                            label={resolveLanguageKey("city")}
                            tooltip={resolveLanguageKey("city")}
                            path="city.name"
                            value={row.city?.name}
                        />
                        <DisplayRow
                            icon={IconPhone}
                            label={resolveLanguageKey("phone")}
                            tooltip={resolveLanguageKey("phone")}
                            path="phone"
                            type="phoneNumber"
                            value={row.phone}
                        />
                        <DisplayRow
                            icon={IconStar}
                            label={resolveLanguageKey("defaultAddress")}
                            tooltip={resolveLanguageKey("defaultAddress")}
                            path="isDefault"
                            type="boolean"
                            value={row.isDefault}
                        />
                    </EntityCard.Body>
                </>
            )}
        </EntityCard>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/customerAddresses/center/cardView/customerAddressCard.tsx"),
    withDebug(true, true),
)(CustomerAddressCard);
