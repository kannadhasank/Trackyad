using IdmToolkit.Data;
using IdmToolkit.Data.Entities;
using IdmToolkit.Data.Repositories.Interfaces;
using IdmToolkit.Domain.Interfaces;
using IdmToolkit.Domain.Models;
using IdmToolkit.Domain.Models.ProductOfferingSnapshots;
using IdmToolkit.Domain.Models.Requests;
using IdmToolkit.Extensions;
using System.Globalization;
using System.Text.Json;
 
namespace IdmToolkit.Services
{
    public class ProductOfferingVersionService(
        IProductOfferingRepository productOfferingRepository,
        IChangeSetRepository changeSetRepository,
        IChangeTargetRepository changeTargetRepository,
        IItemRepository itemRepository,
        IItemAttributeRepository itemAttributeRepository,
        IModifierRepository modifierRepository,
        IProductOfferingModifierGroupMapRepository productOfferingModifierGroupMapRepository,
        IOfferingCategoryTypeService offeringCategoryTypeService,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor) : IProductOfferingVersionService
    {
        private readonly IProductOfferingRepository _productOfferingRepository = productOfferingRepository;
        private readonly IChangeSetRepository _changeSetRepository = changeSetRepository;
        private readonly IChangeTargetRepository _changeTargetRepository = changeTargetRepository;
        private readonly IItemRepository _itemRepository = itemRepository;
        private readonly IItemAttributeRepository _itemAttributeRepository = itemAttributeRepository;
        private readonly IModifierRepository _modifierRepository = modifierRepository;
        private readonly IProductOfferingModifierGroupMapRepository _productOfferingModifierGroupMapRepository = productOfferingModifierGroupMapRepository;
        private readonly IOfferingCategoryTypeService _offeringCategoryTypeService = offeringCategoryTypeService;
        private readonly IUnitOfWork _unitOfWork = unitOfWork;
        private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
 
        public async Task<IEnumerable<ProductOfferingVersionDto>> GetVersionsForItemAsync(int itemCode, CancellationToken cancellationToken)
        {
            var versions = new List<ProductOfferingVersionDto>();
 
            // Get ProductOfferings from main table
            var productOfferings = await _productOfferingRepository.GetByItemCodeAsync(itemCode, cancellationToken);
 
            foreach (var po in productOfferings)
            {
                var baseDetails = new BaseDetailsSnapshot
                {
                    ProductTitle = po.DisplayName,
                    TypeCode = po.TypeCode,
                    OfferCategoryTypeCode = po.OfferingCategoryTypeCode,
                    DisplayTypeCode = po.DisplayTypeCode,
                    ProductOfferingId = po.Id
                };
 
                versions.Add(new ProductOfferingVersionDto
                {
                    ProductOfferingId = po.Id,
                    ChangeSetId = null,
                    ItemCode = itemCode,
                    Status = "Published",
                    PlatformVersionIds = ["ALL"], // Currently only "ALL" is supported
                    StoreNumbers = [], // Empty list means "All Stores"
                    DisplayName = po.DisplayName,
                    TypeCode = po.TypeCode,
                    OfferingCategoryTypeCode = po.OfferingCategoryTypeCode,
                    OfferingCategoryDescription = await GetOfferingCategoryDescriptionAsync(po.OfferingCategoryTypeCode, cancellationToken),
                    DisplayTypeCode = po.DisplayTypeCode,
                    BaseDetails = baseDetails
                });
            }
 
            // Get staging versions (ChangeSet records) for this item
            // ScopeId is always the ItemCode (as string)
            var changeSets = await _changeSetRepository.GetByScopeAsync("ProductOffering", itemCode.ToString(), cancellationToken);
 
            foreach (var cs in changeSets.Where(cs => cs.Status != "Published"))
            {
                // Deserialize all snapshots from ChangeTargets
                var baseDetailsTarget = cs.ChangeTargets.FirstOrDefault(ct => ct.ChangeTargetType == "BaseDetails");
                var overviewDescTarget = cs.ChangeTargets.FirstOrDefault(ct => ct.ChangeTargetType == "OverviewDescription");
                var modifierMappingTarget = cs.ChangeTargets.FirstOrDefault(ct => ct.ChangeTargetType == "ModifierMapping");
                var additionalDataTarget = cs.ChangeTargets.FirstOrDefault(ct => ct.ChangeTargetType == "AdditionalData");
 
                BaseDetailsSnapshot? baseDetails = null;
                if (baseDetailsTarget?.ProposedSnapshot != null)
                {
                    baseDetails = JsonSerializer.Deserialize<BaseDetailsSnapshot>(baseDetailsTarget.ProposedSnapshot);
                }
 
                OverviewDescriptionSnapshot? overviewDesc = null;
                if (overviewDescTarget?.ProposedSnapshot != null)
                {
                    overviewDesc = JsonSerializer.Deserialize<OverviewDescriptionSnapshot>(overviewDescTarget.ProposedSnapshot);
                }
 
                ModifierMappingSnapshot? modifierMapping = null;
                if (modifierMappingTarget?.ProposedSnapshot != null)
                {
                    modifierMapping = JsonSerializer.Deserialize<ModifierMappingSnapshot>(modifierMappingTarget.ProposedSnapshot);
                }
 
                AdditionalDataSnapshot? additionalData = null;
                if (additionalDataTarget?.ProposedSnapshot != null)
                {
                    additionalData = JsonSerializer.Deserialize<AdditionalDataSnapshot>(additionalDataTarget.ProposedSnapshot);
                }
 
                versions.Add(new ProductOfferingVersionDto
                {
                    // ProductOfferingId comes from the snapshot, linking this ChangeSet to a ProductOffering
                    ProductOfferingId = baseDetails?.ProductOfferingId,
                    ChangeSetId = cs.Id,
                    ItemCode = itemCode,
                    Status = cs.Status ?? "InProgress",
                    PlatformVersionIds = ["ALL"], // TODO: Parse from ChangeSet metadata once implemented
                    StoreNumbers = [],
                    DisplayName = baseDetails?.ProductTitle,
                    TypeCode = baseDetails?.TypeCode,
                    OfferingCategoryTypeCode = baseDetails?.OfferCategoryTypeCode,
                    OfferingCategoryDescription = await GetOfferingCategoryDescriptionAsync(baseDetails?.OfferCategoryTypeCode, cancellationToken),
                    DisplayTypeCode = baseDetails?.DisplayTypeCode,
                    BaseDetails = baseDetails,
                    OverviewDescription = overviewDesc,
                    ModifierMapping = modifierMapping,
                    AdditionalData = additionalData
                });
            }
 
            // If there's an in-progress ChangeSet for a ProductOffering, remove the published version
            // (we only want to show the in-progress version, not both)
            var inProgressProductOfferingIds = versions
                .Where(v => v.ChangeSetId.HasValue && v.ProductOfferingId.HasValue)
                .Select(v => v.ProductOfferingId!.Value)
                .ToHashSet();
 
            versions = versions
                .Where(v => !v.ProductOfferingId.HasValue ||
                           v.ChangeSetId.HasValue ||
                           !inProgressProductOfferingIds.Contains(v.ProductOfferingId.Value))
                .ToList();
 
            return versions;
        }
 
        public async Task<ProductOfferingVersionDto?> GetVersionByIdAsync(int? productOfferingId, int? changeSetId, CancellationToken cancellationToken)
        {
            if (changeSetId.HasValue)
            {
                var changeSet = await _changeSetRepository.GetByIdWithTargetsAsync(changeSetId.Value, cancellationToken);
                if (changeSet == null) return null;
 
                // Deserialize all ChangeTarget snapshots
                var baseDetailsTarget = changeSet.ChangeTargets.FirstOrDefault(ct => ct.ChangeTargetType == "BaseDetails");
                var overviewDescTarget = changeSet.ChangeTargets.FirstOrDefault(ct => ct.ChangeTargetType == "OverviewDescription");
                var modifierMappingTarget = changeSet.ChangeTargets.FirstOrDefault(ct => ct.ChangeTargetType == "ModifierMapping");
                var additionalDataTarget = changeSet.ChangeTargets.FirstOrDefault(ct => ct.ChangeTargetType == "AdditionalData");
 
                BaseDetailsSnapshot? baseDetails = null;
                if (baseDetailsTarget?.ProposedSnapshot != null)
                {
                    baseDetails = JsonSerializer.Deserialize<BaseDetailsSnapshot>(baseDetailsTarget.ProposedSnapshot);
                }
 
                OverviewDescriptionSnapshot? overviewDesc = null;
                if (overviewDescTarget?.ProposedSnapshot != null)
                {
                    overviewDesc = JsonSerializer.Deserialize<OverviewDescriptionSnapshot>(overviewDescTarget.ProposedSnapshot);
                }
 
                ModifierMappingSnapshot? modifierMapping = null;
                if (modifierMappingTarget?.ProposedSnapshot != null)
                {
                    modifierMapping = JsonSerializer.Deserialize<ModifierMappingSnapshot>(modifierMappingTarget.ProposedSnapshot);
                }
 
                AdditionalDataSnapshot? additionalData = null;
                if (additionalDataTarget?.ProposedSnapshot != null)
                {
                    additionalData = JsonSerializer.Deserialize<AdditionalDataSnapshot>(additionalDataTarget.ProposedSnapshot);
                }
 
                // ScopeId is ItemCode (as string)
                var itemCode = int.TryParse(changeSet.ScopeId, out var parsedItemCode) ? parsedItemCode : 0;
 
                // Always refresh read-only Source* fields from live PIMS data so the page reflects current values,
                // while keeping persisted editable fields (e.g. EnableOnlinePay, ProductTitle) from the snapshot.
                if (itemCode > 0)
                {
                    baseDetails ??= new BaseDetailsSnapshot();
                    overviewDesc ??= new OverviewDescriptionSnapshot();
                    additionalData ??= new AdditionalDataSnapshot();
                    await RefreshSourceItemDataAsync(itemCode, baseDetails, overviewDesc, item: null, cancellationToken);
                    await PopulateAdditionalDataAsync(itemCode, additionalData, cancellationToken);
                }
 
                var presentationCategories = await GetPresentationCategoriesForReviewAsync(itemCode, baseDetails?.SourceFamilyGroup, cancellationToken);
                var presentationCategoryFilter = itemCode > 0
                    ? await _itemAttributeRepository.GetIdmItemAttributeValueAsync(itemCode, 64, cancellationToken)
                    : null;
                var smartLabelUrl = itemCode > 0
                    ? await _itemRepository.GetSmartLabelUrlForItemAsync(itemCode, cancellationToken)
                    : null;
                var showHideRules = await GetShowHideRulesForModifierMappingAsync(modifierMapping, cancellationToken);
                await HydrateModifierMappingImageUrlsAsync(modifierMapping, cancellationToken);
 
                return new ProductOfferingVersionDto
                {
                    // ProductOfferingId comes from the snapshot
                    ProductOfferingId = baseDetails?.ProductOfferingId,
                    ChangeSetId = changeSet.Id,
                    ItemCode = itemCode,
                    Status = changeSet.Status ?? "InProgress",
                    PlatformVersionIds = ["ALL"],
                    StoreNumbers = [],
                    // Quick-access fields from BaseDetails
                    DisplayName = baseDetails?.ProductTitle,
                    TypeCode = baseDetails?.TypeCode,
                    OfferingCategoryTypeCode = baseDetails?.OfferCategoryTypeCode,
                    OfferingCategoryDescription = await GetOfferingCategoryDescriptionAsync(baseDetails?.OfferCategoryTypeCode, cancellationToken),
                    DisplayTypeCode = baseDetails?.DisplayTypeCode,
                    // Full snapshots
                    BaseDetails = baseDetails,
                    OverviewDescription = overviewDesc,
                    ModifierMapping = modifierMapping,
                    AdditionalData = additionalData,
                    PresentationCategories = presentationCategories,
                    PresentationCategoryFilter = presentationCategoryFilter,
                    SmartLabelUrl = smartLabelUrl,
                    ShowHideRules = showHideRules
                };
            }
 
            if (productOfferingId.HasValue)
            {
                var productOffering = await _productOfferingRepository.GetById(productOfferingId.Value, cancellationToken);
                if (productOffering == null) return null;
 
                // Get the live Item for this ProductOffering so we can both derive ItemCode
                // and reuse it when populating Source* fields (avoids a second DB roundtrip).
                var items = await _itemRepository.GetForProductOfferingIds([productOfferingId.Value], cancellationToken);
                var item = items?.FirstOrDefault();
                var itemCode = item?.ItemCode ?? 0;
 
                // For published ProductOfferings, we don't have ChangeTarget snapshots
                // Build snapshots from ProductOffering and Item data
                var baseDetails = new BaseDetailsSnapshot
                {
                    ProductTitle = productOffering.DisplayName,
                    TypeCode = productOffering.TypeCode,
                    OfferCategoryTypeCode = productOffering.OfferingCategoryTypeCode,
                    DisplayTypeCode = productOffering.DisplayTypeCode,
                    ProductOfferingId = productOffering.Id
                };
                var overviewDesc = new OverviewDescriptionSnapshot();
 
                // Refresh source item information from live PIMS data for the published view.
                if (itemCode > 0)
                {
                    await RefreshSourceItemDataAsync(itemCode, baseDetails, overviewDesc, item, cancellationToken);
                }
 
                var presentationCategories = await GetPresentationCategoriesForReviewAsync(itemCode, baseDetails.SourceFamilyGroup, cancellationToken);
                var presentationCategoryFilter = itemCode > 0
                    ? await _itemAttributeRepository.GetIdmItemAttributeValueAsync(itemCode, 64, cancellationToken)
                    : null;
                var smartLabelUrl = itemCode > 0
                    ? await _itemRepository.GetSmartLabelUrlForItemAsync(itemCode, cancellationToken)
                    : null;
 
                var additionalData = new AdditionalDataSnapshot();
                if (itemCode > 0)
                {
                    await PopulateAdditionalDataAsync(itemCode, additionalData, cancellationToken);
                }
 
                // Load modifier mappings from ProductOfferingModifierGroupMap table
                var modifierMappingSnapshot = await BuildModifierMappingSnapshotAsync(productOfferingId.Value, cancellationToken);
                await HydrateModifierMappingImageUrlsAsync(modifierMappingSnapshot, cancellationToken);
                var showHideRules = await GetShowHideRulesForModifierMappingAsync(modifierMappingSnapshot, cancellationToken);
 
                return new ProductOfferingVersionDto
                {
                    ProductOfferingId = productOffering.Id,
                    ChangeSetId = null,
                    ItemCode = itemCode,
                    Status = "Published",
                    PlatformVersionIds = ["ALL"],
                    StoreNumbers = [],
                    DisplayName = productOffering.DisplayName,
                    TypeCode = productOffering.TypeCode,
                    OfferingCategoryTypeCode = productOffering.OfferingCategoryTypeCode,
                    OfferingCategoryDescription = await GetOfferingCategoryDescriptionAsync(productOffering.OfferingCategoryTypeCode, cancellationToken),
                    DisplayTypeCode = productOffering.DisplayTypeCode,
                    BaseDetails = baseDetails,
                    OverviewDescription = overviewDesc,
                    ModifierMapping = modifierMappingSnapshot,
                    AdditionalData = additionalData,
                    PresentationCategories = presentationCategories,
                    PresentationCategoryFilter = presentationCategoryFilter,
                    SmartLabelUrl = smartLabelUrl,
                    ShowHideRules = showHideRules
                };
            }
 
            return null;
        }
 
        public async Task<ProductOfferingVersionDto> LoadVersionForEditingAsync(int itemCode, int? changeSetId, int? productOfferingId, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }
 
        /// <summary>
        /// Builds a ModifierMappingSnapshot from ProductOfferingModifierGroupMap table for a published ProductOffering.
        /// Groups modifiers by modifier group and orders them by sequence numbers.
        /// </summary>
        private async Task<ModifierMappingSnapshot> BuildModifierMappingSnapshotAsync(int productOfferingId, CancellationToken cancellationToken)
        {
            var maps = await _productOfferingModifierGroupMapRepository.FindAsync(
                productOfferingId: productOfferingId,
                modifierGroupId: null,
                modifierId: null,
                cancellationToken: cancellationToken);
 
            // Group by ModifierGroupId
            var grouped = maps.GroupBy(m => m.ModifierGroupId);
 
            var modifierGroupMappings = new List<ModifierGroupMapping>();
 
            foreach (var grouping in grouped.OrderBy(g => g.Min(m => m.ModifierGroupSequenceNumber)))
            {
                var firstInGroup = grouping.First();
                var modifierGroupId = grouping.Key;
                var modifierGroupName = firstInGroup.ModifierGroup?.Description;
 
                var modifierMappings = grouping
                    .OrderBy(m => m.ModifierSequenceNumber)
                    .Select(m => new ModifierMapping
                    {
                        ModifierId = m.ModifierId,
                        ModifierName = m.Modifier?.Description,
                        DisplaySequence = m.ModifierSequenceNumber,
                        PrintSequence = m.ModifierSequenceNumber, // Default print sequence to display sequence
                        IsDefaultModifier = m.IsDefaultModifier
                    })
                    .ToList();
 
                modifierGroupMappings.Add(new ModifierGroupMapping
                {
                    ModifierGroupId = modifierGroupId,
                    ModifierGroupName = modifierGroupName,
                    DisplaySequence = firstInGroup.ModifierGroupSequenceNumber,
                    PrintSequence = firstInGroup.ModifierGroupSequenceNumber, // Default print sequence to display sequence
                    EnablePortions = false, // TODO: Map this once the database field is identified
                    Modifiers = modifierMappings
                });
            }
 
            return new ModifierMappingSnapshot
            {
                ModifierGroupMappings = modifierGroupMappings
            };
        }
 
        private async Task HydrateModifierMappingImageUrlsAsync(ModifierMappingSnapshot? modifierMapping, CancellationToken cancellationToken)
        {
            if (modifierMapping?.ModifierGroupMappings is null)
            {
                return;
            }
 
            var modifierIds = modifierMapping.ModifierGroupMappings
                .SelectMany(group => group.Modifiers)
                .Select(modifier => modifier.ModifierId)
                .Distinct()
                .ToList();
 
            var modifierImageUrlsById = new Dictionary<int, (string? MobileImageUrl, string? WebImageUrl)>();
 
            foreach (var modifierId in modifierIds)
            {
                var modifier = await _modifierRepository.GetById(modifierId, cancellationToken);
                modifierImageUrlsById[modifierId] = (GetModifierImageUrl(modifier, "mobile"), GetModifierImageUrl(modifier, "web"));
            }
 
            foreach (var modifier in modifierMapping.ModifierGroupMappings.SelectMany(group => group.Modifiers))
            {
                if (modifierImageUrlsById.TryGetValue(modifier.ModifierId, out var imageUrls))
                {
                    modifier.MobileImageUrl = imageUrls.MobileImageUrl;
                    modifier.WebImageUrl = imageUrls.WebImageUrl;
                }
            }
        }
 
        private static string? GetModifierImageUrl(Modifier? modifier, string imageType)
        {
            var attributeValue = modifier?.Attributes?
                .FirstOrDefault(attribute => IsModifierImageAttribute(attribute, imageType))
                ?.Value;
 
            if (!string.IsNullOrWhiteSpace(attributeValue))
            {
                return attributeValue;
            }
 
            return imageType.Equals("web", StringComparison.OrdinalIgnoreCase) ? modifier?.Image : null;
        }
 
        private static bool IsModifierImageAttribute(ModifierAttribute attribute, string imageType)
        {
            var code = attribute.Type?.Code;
            var description = attribute.Type?.Description;
 
            return IsModifierImageAttributeName(code, imageType)
                || IsModifierImageAttributeName(description, imageType);
        }
 
        private static bool IsModifierImageAttributeName(string? value, string imageType)
        {
            if (!ContainsImageText(value))
            {
                return false;
            }
 
            return imageType.Equals("mobile", StringComparison.OrdinalIgnoreCase)
                ? ContainsIgnoreCase(value, "mobile") || ContainsIgnoreCase(value, "mob")
                : ContainsIgnoreCase(value, imageType);
        }
 
        private static bool ContainsIgnoreCase(string? value, string searchValue)
        {
            return value?.Contains(searchValue, StringComparison.OrdinalIgnoreCase) == true;
        }
 
        private static bool ContainsImageText(string? value)
        {
            return ContainsIgnoreCase(value, "image") || ContainsIgnoreCase(value, "img");
        }
 
        private async Task<List<ShowHideRuleDto>> GetShowHideRulesForModifierMappingAsync(ModifierMappingSnapshot? modifierMapping, CancellationToken cancellationToken)
        {
            var modifierGroupIds = modifierMapping?.ModifierGroupMappings
                .Select(g => g.ModifierGroupId)
                .Distinct()
                .ToList() ?? [];
 
            var modifierIds = modifierMapping?.ModifierGroupMappings
                .SelectMany(g => g.Modifiers)
                .Select(m => m.ModifierId)
                .Distinct()
                .ToList() ?? [];
 
            if (modifierGroupIds.Count == 0 || modifierIds.Count == 0)
            {
                return [];
            }
 
            var rules = await _productOfferingModifierGroupMapRepository.GetShowHideRulesForMappingAsync(modifierIds, modifierGroupIds, cancellationToken);
            return rules.Select(MapShowHideRuleToDto).ToList();
        }
 
 private async Task<List<ShowHideRuleDto>> GetShowHideRulesForModifierMappingAsync(ModifierMappingSnapshot? modifierMapping, CancellationToken cancellationToken)
        {
            var modifierGroupIds = modifierMapping?.ModifierGroupMappings
                .Select(g => g.ModifierGroupId)
                .Distinct()
                .ToList() ?? [];
 
            var modifierIds = modifierMapping?.ModifierGroupMappings
                .SelectMany(g => g.Modifiers)
                .Select(m => m.ModifierId)
                .Distinct()
                .ToList() ?? [];
 
            if (modifierGroupIds.Count == 0 || modifierIds.Count == 0)
            {
                return [];
            }
 
            var rules = await _productOfferingModifierGroupMapRepository.GetShowHideRulesForMappingAsync(modifierIds, modifierGroupIds, cancellationToken);
            return rules.Select(MapShowHideRuleToDto).ToList();
        }
 
            private static ShowHideRuleDto MapShowHideRuleToDto(ProductOfferingModifierGroupMap entity)
            {
                return new ShowHideRuleDto
                {
                    ModifierGroupId = entity.ModifierGroupId,
                    ModifierId = entity.ModifierId,
                    IsModifierGroupExcluded = entity.IsModifierGroupExcluded,
                    EffectiveDate = entity.EffectiveDate,
                    TerminationDate = entity.TerminationDate,
                    LastUpdatedDate = entity.LastUpdatedDate,
                    LastUpdatedBy = entity.LastUpdatedBy,
                    ModifierGroup = entity.ModifierGroup == null ? null : new ModifierGroupDto
                    {
                        Id = entity.ModifierGroup.Id,
                        Description = entity.ModifierGroup.Description,
                        DisplayName = entity.ModifierGroup.DisplayName,
                        DisplayNameError = entity.ModifierGroup.DisplayNameError,
                        DisplayStyle = entity.ModifierGroup.DisplayStyle,
                        LayerSequence = entity.ModifierGroup.LayerSequence,
                        Css = entity.ModifierGroup.Css,
                        LastUpdatedBy = entity.ModifierGroup.LastUpdatedBy,
                        LastUpdatedDate = entity.ModifierGroup.LastUpdatedDate
                    },
                    Modifier = entity.Modifier == null ? null : new ModifierDto
                    {
                        Id = entity.Modifier.Id,
                        Description = entity.Modifier.Description,
                        DisplayName = entity.Modifier.DisplayName,
                        WeightAmount = entity.Modifier.WeightAmount,
                        FullDisplayName = entity.Modifier.FullDisplayName,
                        Image = entity.Modifier.Image,
                        Css = entity.Modifier.Css,
                        LastUpdatedBy = entity.Modifier.LastUpdatedBy,
                        LastUpdatedDate = entity.Modifier.LastUpdatedDate
                    }
                };
            }
 
            private static string GetItemDisplayName(Item item)
            {
                if (!string.IsNullOrWhiteSpace(item.AssociatedTypeCode) &&
                    !string.IsNullOrWhiteSpace(item.AssociatedTypeDisplayName))
                {
                    return item.AssociatedTypeDisplayName;
                }
 
                if (!string.IsNullOrWhiteSpace(item.DisplayName))
                {
                    return item.DisplayName;
                }
 
                if (!string.IsNullOrWhiteSpace(item.AdDescription))
                {
                    return item.AdDescription;
                }
 
                if (!string.IsNullOrWhiteSpace(item.Description))
                {
                    return item.Description;
                }
 
                return "No Name";
            }
 
            private async Task PopulateAdditionalDataAsync(int itemCode, AdditionalDataSnapshot additionalData, CancellationToken cancellationToken)
            {
                var existingIdmTypeIds = additionalData.IdmAttributes.Select(a => a.TypeId).ToHashSet();
                var idmAttributes = await _itemAttributeRepository.GetIdmItemAttributesAsync(itemCode, cancellationToken);
 
                foreach (var attribute in idmAttributes.Where(a => !existingIdmTypeIds.Contains(a.TypeId)))
                {
                    additionalData.IdmAttributes.Add(new IdmItemAttributeSnapshot
                    {
                        ItemCode = attribute.ItemCode,
                        PublicationStatus = attribute.PublicationStatus,
                        TypeId = attribute.TypeId,
                        TypeCode = attribute.Type?.Code,
                        TypeDescription = attribute.Type?.Description,
                        Value = attribute.Value,
                        EffectiveDate = attribute.EffectiveDate,
                        TerminationDate = attribute.TerminationDate,
                        LastUpdatedDate = attribute.LastUpdatedDate,
                        LastUpdatedBy = attribute.LastUpdatedBy
                    });
                }
 
                var existingSourceKeys = additionalData.SourceAttributes.Select(a => GetSourceAttributeKey(a.GroupCode, a.Code)).ToHashSet();
                var sourceAttributes = await _itemAttributeRepository.GetSourceItemAttributesAsync(itemCode, cancellationToken);
 
                foreach (var attribute in sourceAttributes.Where(a => !existingSourceKeys.Contains(GetSourceAttributeKey(a.GroupCode, a.Code))))
                {
                    additionalData.SourceAttributes.Add(new SourceItemAttributeSnapshot
                    {
                        ItemCode = attribute.ItemCode,
                        GroupCode = attribute.GroupCode,
                        Code = attribute.Code,
                        GroupType = attribute.Config?.GroupType,
                        GroupTypeValue = attribute.Config?.GroupTypeValue,
                        Name = attribute.Name,
                        Value = attribute.Value,
                        EffectiveDate = attribute.EffectiveDate,
                        TerminationDate = attribute.TerminationDate,
                        CreatedTime = attribute.CreatedTime,
                        LastUpdatedDate = attribute.LastUpdatedDate,
                        LastUpdatedBy = attribute.LastUpdatedBy
                    });
                }
            }
 
            private static string GetSourceAttributeKey(int groupCode, int code) => $"{groupCode}:{code}";
 
            public async Task<ProductOfferingVersionDto> CreateVersionAsync(CreateProductOfferingVersionRequest request, CancellationToken cancellationToken)
            {
                // Validate platform selection (currently only "ALL" is allowed)
                if (!request.PlatformVersionIds.Contains("ALL") || request.PlatformVersionIds.Count != 1)
                {
                    throw new ArgumentException("Currently, only 'ALL' platforms selection is supported.");
                }
 
                // Validate store selection (currently only "All Stores" - empty list - is allowed)
                if (request.StoreNumbers.Count > 0)
                {
                    throw new ArgumentException("Currently, only 'All Stores' selection is supported. Leave StoreNumbers empty.");
                }
 
                // Check unique constraint: Item + Platform + Store combination must be unique
                await ValidateUniqueVersionAsync(request.ItemCode, request.PlatformVersionIds, request.StoreNumbers, null, cancellationToken);
 
                var currentUser = _httpContextAccessor.GetCurrentEmployeeId();
                var now = DateTime.UtcNow;
 
                // ScopeId is always the ItemCode (scope is the item, not the ProductOffering)
                var scopeId = request.ItemCode.ToString();
 
                // Create ChangeSet
                var changeSet = new ChangeSet
                {
                    Description = $"Item Setup for Item {request.ItemCode}",
                    Status = "InProgress",
                    ScopeType = "ProductOffering",
                    ScopeId = scopeId,
                    CreatedBy = currentUser,
                    CreatedAtUtc = now
                };
 
                _changeSetRepository.Add(changeSet);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
 
                // Get the item to determine if it has a ProductOfferingId
                var item = await _itemRepository.GetByItemCodeAsync(request.ItemCode, cancellationToken);
 
                // Use snapshots from request, or initialize empty ones
                var baseDetails = request.BaseDetails ?? new BaseDetailsSnapshot
                {
                    // Store the ProductOfferingId to link this ChangeSet to a specific ProductOffering
                    // This is null for new items that don't have a ProductOffering yet
                    ProductOfferingId = item?.ProductOfferingId
                };
 
                // Ensure ProductOfferingId is set if item exists
                if (item?.ProductOfferingId != null)
                {
                    baseDetails.ProductOfferingId = item.ProductOfferingId;
                }
 
                var overviewDescription = request.OverviewDescription ?? new OverviewDescriptionSnapshot();
                var modifierMapping = request.ModifierMapping ?? new ModifierMappingSnapshot();
                var additionalData = request.AdditionalData ?? new AdditionalDataSnapshot();
 
                // Populate snapshots with PIMS source data (for new items or to refresh read-only fields)
                // This will merge PIMS data with any user-provided data
                await PopulateSnapshotsFromSourceDataAsync(request.ItemCode, baseDetails, overviewDescription, cancellationToken);
                await PopulateAdditionalDataAsync(request.ItemCode, additionalData, cancellationToken);
 
                // Create ChangeTarget records with serialized snapshots
                var baseDetailsTarget = new ChangeTarget
                {
                    ChangeSetId = changeSet.Id,
                    ChangeTargetType = "BaseDetails",
                    ProposedSnapshot = JsonSerializer.Serialize(baseDetails)
                };
                _changeTargetRepository.Add(baseDetailsTarget);
 
                var overviewDescriptionTarget = new ChangeTarget
                {
                    ChangeSetId = changeSet.Id,
                    ChangeTargetType = "OverviewDescription",
                    ProposedSnapshot = JsonSerializer.Serialize(overviewDescription)
                };
                _changeTargetRepository.Add(overviewDescriptionTarget);
 
                var modifierMappingTarget = new ChangeTarget
                {
                    ChangeSetId = changeSet.Id,
                    ChangeTargetType = "ModifierMapping",
                    ProposedSnapshot = JsonSerializer.Serialize(modifierMapping)
                };
                _changeTargetRepository.Add(modifierMappingTarget);
 
                var additionalDataTarget = new ChangeTarget
                {
                    ChangeSetId = changeSet.Id,
                    ChangeTargetType = "AdditionalData",
                    ProposedSnapshot = JsonSerializer.Serialize(additionalData)
                };
                _changeTargetRepository.Add(additionalDataTarget);
 
                await _unitOfWork.SaveChangesAsync(cancellationToken);
 
                return new ProductOfferingVersionDto
                {
                    ProductOfferingId = null,
                    ChangeSetId = changeSet.Id,
                    ItemCode = request.ItemCode,
                    Status = "InProgress",
                    PlatformVersionIds = request.PlatformVersionIds,
                    StoreNumbers = request.StoreNumbers,
                    DisplayName = baseDetails.ProductTitle,
                    TypeCode = baseDetails.TypeCode,
                    OfferingCategoryTypeCode = baseDetails.OfferCategoryTypeCode,
                    OfferingCategoryDescription = await GetOfferingCategoryDescriptionAsync(baseDetails.OfferCategoryTypeCode, cancellationToken),
                    DisplayTypeCode = baseDetails.DisplayTypeCode,
                    BaseDetails = baseDetails,
                    OverviewDescription = overviewDescription,
                    ModifierMapping = modifierMapping,
                    AdditionalData = additionalData
                };
            }
 
            public async Task<ProductOfferingVersionDto> UpdateVersionAsync(UpdateProductOfferingVersionRequest request, CancellationToken cancellationToken)
            {
                var changeSet = await _changeSetRepository.GetByIdWithTargetsAsync(request.ChangeSetId, cancellationToken);
                if (changeSet == null)
                {
                    throw new InvalidOperationException($"ChangeSet with ID {request.ChangeSetId} not found.");
                }
 
                // Validate platform/store changes if provided
                if (request.PlatformVersionIds != null)
                {
                    if (!request.PlatformVersionIds.Contains("ALL") || request.PlatformVersionIds.Count != 1)
                    {
                        throw new ArgumentException("Currently, only 'ALL' platforms selection is supported.");
                    }
                }
 
                if (request.StoreNumbers != null && request.StoreNumbers.Count > 0)
                {
                    throw new ArgumentException("Currently, only 'All Stores' selection is supported. Leave StoreNumbers empty.");
                }
 
                // TODO: When platform/store support is expanded beyond "ALL"/"All Stores",
                // validate uniqueness and persist platform/store scope changes to ChangeSet or related entities
 
                var currentUser = _httpContextAccessor.GetCurrentEmployeeId();
                var now = DateTime.UtcNow;
 
                // Update or create BaseDetails ChangeTarget
                if (request.BaseDetails != null)
                {
                    var baseDetailsTarget = await _changeTargetRepository.GetByChangeSetIdAndTypeAsync(request.ChangeSetId, "BaseDetails", cancellationToken);
                    if (baseDetailsTarget != null)
                    {
                        baseDetailsTarget.ProposedSnapshot = JsonSerializer.Serialize(request.BaseDetails);
                        _changeTargetRepository.Update(baseDetailsTarget);
                    }
                    else
                    {
                        baseDetailsTarget = new ChangeTarget
                        {
                            ChangeSetId = request.ChangeSetId,
                            ChangeTargetType = "BaseDetails",
                            ProposedSnapshot = JsonSerializer.Serialize(request.BaseDetails)
                        };
                        _changeTargetRepository.Add(baseDetailsTarget);
                    }
                }
 
                // Update or create OverviewDescription ChangeTarget
                if (request.OverviewDescription != null)
                {
                    var overviewDescriptionTarget = await _changeTargetRepository.GetByChangeSetIdAndTypeAsync(request.ChangeSetId, "OverviewDescription", cancellationToken);
                    if (overviewDescriptionTarget != null)
                    {
                        overviewDescriptionTarget.ProposedSnapshot = JsonSerializer.Serialize(request.OverviewDescription);
                        _changeTargetRepository.Update(overviewDescriptionTarget);
                    }
                    else
                    {
                        overviewDescriptionTarget = new ChangeTarget
                        {
                            ChangeSetId = request.ChangeSetId,
                            ChangeTargetType = "OverviewDescription",
                            ProposedSnapshot = JsonSerializer.Serialize(request.OverviewDescription)
                        };
                        _changeTargetRepository.Add(overviewDescriptionTarget);
                    }
                }
 
                // Update or create ModifierMapping ChangeTarget
                if (request.ModifierMapping != null)
                {
                    var modifierMappingTarget = await _changeTargetRepository.GetByChangeSetIdAndTypeAsync(request.ChangeSetId, "ModifierMapping", cancellationToken);
                    if (modifierMappingTarget != null)
                    {
                        modifierMappingTarget.ProposedSnapshot = JsonSerializer.Serialize(request.ModifierMapping);
                        _changeTargetRepository.Update(modifierMappingTarget);
                    }
                    else
                    {
                        modifierMappingTarget = new ChangeTarget
                        {
                            ChangeSetId = request.ChangeSetId,
                            ChangeTargetType = "ModifierMapping",
                            ProposedSnapshot = JsonSerializer.Serialize(request.ModifierMapping)
                        };
                        _changeTargetRepository.Add(modifierMappingTarget);
                    }
                }
 
                // Update or create AdditionalData ChangeTarget
                if (request.AdditionalData != null)
                {
                    var additionalDataTarget = await _changeTargetRepository.GetByChangeSetIdAndTypeAsync(request.ChangeSetId, "AdditionalData", cancellationToken);
                    if (additionalDataTarget != null)
                    {
                        additionalDataTarget.ProposedSnapshot = JsonSerializer.Serialize(request.AdditionalData);
                        _changeTargetRepository.Update(additionalDataTarget);
                    }
                    else
                    {
                        additionalDataTarget = new ChangeTarget
                        {
                            ChangeSetId = request.ChangeSetId,
                            ChangeTargetType = "AdditionalData",
                            ProposedSnapshot = JsonSerializer.Serialize(request.AdditionalData)
                        };
                        _changeTargetRepository.Add(additionalDataTarget);
                    }
                }
 
                // Update ChangeSet metadata
                _changeSetRepository.Update(changeSet);
 
                await _unitOfWork.SaveChangesAsync(cancellationToken);
 
                return (await GetVersionByIdAsync(null, request.ChangeSetId, cancellationToken))!;
            }
 
            public async Task DeleteStagingVersionAsync(int changeSetId, CancellationToken cancellationToken)
            {
                var changeSet = await _changeSetRepository.GetById(changeSetId, cancellationToken);
                if (changeSet == null)
                {
                    throw new InvalidOperationException($"ChangeSet with ID {changeSetId} not found.");
                }
 
                // Soft delete by setting status
                changeSet.Status = "Deleted";
                _changeSetRepository.Update(changeSet);
 
                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }
 
            private async Task<string?> GetOfferingCategoryDescriptionAsync(string? categoryCode, CancellationToken cancellationToken)
            {
                if (string.IsNullOrWhiteSpace(categoryCode))
                {
                    return null;
                }
 
                var category = await _offeringCategoryTypeService.GetOfferingCategoryTypeByCodeAsync(categoryCode, cancellationToken);
                return category?.Description ?? categoryCode;
            }
 
 
            private async Task<List<PresentationCategoryReviewDto>> GetPresentationCategoriesForReviewAsync(
                int itemCode,
                string? familyGroup,
                CancellationToken cancellationToken)
            {
                if (itemCode <= 0 || string.IsNullOrWhiteSpace(familyGroup))
                {
                    return [];
                }
 
                var categories = await _itemRepository.GetPresentationCategoriesForItemGroupAsync(familyGroup, cancellationToken);
                return categories
                    .Select(c => new PresentationCategoryReviewDto
                    {
                        SequenceNumber = c.SequenceNumber,
                        FauxTaxonomy = c.FauxTaxonomy
                    })
                    .ToList();
            }
 
            /// <summary>
            /// Populates snapshot models with source data from PIMS Item table.
            /// Called when creating a new version to pre-fill read-only reference fields.
            /// </summary>
            private async Task PopulateSnapshotsFromSourceDataAsync(
                int itemCode,
                BaseDetailsSnapshot baseDetails,
                OverviewDescriptionSnapshot overviewDescription,
                CancellationToken cancellationToken)
            {
                var item = await _itemRepository.GetById(itemCode, cancellationToken);
                if (item == null) return;
 
                // Refresh read-only source fields from live PIMS data.
                await RefreshSourceItemDataAsync(itemCode, baseDetails, overviewDescription, item, cancellationToken);
 
                // Initialize editable fields from PIMS for new versions only.
                baseDetails.EnableOnlinePay = item.IsOnlinePay == 1;
                baseDetails.IsHeroItem = item.IsHeroItem ?? false;
 
                // TODO: Populate Syndigo data from external source when available
                // For now, Syndigo fields remain empty/null
 
                // Set default IDM description source
                overviewDescription.Idm.DescriptionSource = "SystemDefault";
            }
 
            /// <summary>
            /// Refreshes the read-only Source* fields on the snapshot from the live Item table so that
            /// existing versions always display current PIMS data without overwriting editable fields.
            /// </summary>
            private async Task RefreshSourceItemDataAsync(
                int itemCode,
                BaseDetailsSnapshot baseDetails,
                OverviewDescriptionSnapshot? overviewDescription,
                Item? item,
                CancellationToken cancellationToken)
            {
                item ??= await _itemRepository.GetById(itemCode, cancellationToken);
                if (item == null) return;
 
                // Populate BaseDetails source item information fields (read-only PIMS data)
                baseDetails.SourceItemName = item.DisplayName;
                baseDetails.SourceItemDescription = item.AdDescription;
                baseDetails.SourceFamilyGroup = item.FamilyGroup?.ToString();
                baseDetails.SourceSubDepartment = item.SubDeptNumber?.ToString();
                baseDetails.SourceSizeUom = item.SizeUom;
                baseDetails.SourceSizeDescription = item.SizeDescription;
                baseDetails.SourceSellableUom = item.SellableUom;
                baseDetails.SourceServingSize = item.Size?.ToString();
                baseDetails.SourceScaleLookupCode = item.ScalePluCode?.ToString();
 
                // GTINs from ItemGtin table - may be multiple per item; format decimals as digits-only strings.
                var primaryGtin = await _itemRepository.GetPrimaryGtinForItemAsync(itemCode, cancellationToken);
                baseDetails.PrimaryGtin = primaryGtin != 0
                    ? primaryGtin.ToString("F0", CultureInfo.InvariantCulture)
                    : null;
 
                // Buyer Group from ItemGroupMembership where GroupTypeCode = 'BYG'; render int? as string for display.
                var buyerGroupCode = await _itemRepository.GetGroupCodeForItemAsync(itemCode, "BYG", cancellationToken);
                baseDetails.SourceBuyerGroup = buyerGroupCode?.ToString(CultureInfo.InvariantCulture);
 
                // Populate OverviewDescription PIMS data fields (read-only from PIMS).
                if (overviewDescription != null)
                {
                    overviewDescription.Pims ??= new PimsData();
                    overviewDescription.Pims.ItemDescription = item.AdDescription;
                    overviewDescription.Pims.ScaleDescriptionFirstLine = item.ScaleDescriptionFirstLine;
                    overviewDescription.Pims.ScaleDescriptionSecondLine = item.ScaleDescriptionSecondLine;
 
                    // Seed the editable IDM item description from the Item table Description column.
                    // Only seed when it has not already been edited so saved user edits are preserved on refresh.
                    overviewDescription.Idm ??= new IdmDescriptionData();
                    if (string.IsNullOrWhiteSpace(overviewDescription.Idm.ItemDescription))
                    {
                        overviewDescription.Idm.ItemDescription = item.Description;
                    }
 
                    // Populate Syndigo data fields from UpcDetail table (external Syndigo source).
                    // Editable Syndigo fields (UsageDirections, ProductDescription) are only
                    // seeded from source when they have not already been edited in the snapshot,
                    // so previously saved user edits are preserved on refresh.
                    var upcDetail = await _itemRepository.GetUpcDetailForItemAsync(itemCode, cancellationToken);
                    if (upcDetail != null)
                    {
                        overviewDescription.Syndigo ??= new SyndigoData();
                        overviewDescription.Syndigo.BrandName = upcDetail.BrandName;
                        overviewDescription.Syndigo.TitleDescription = upcDetail.ProductDescription;
                        overviewDescription.Syndigo.LineDescription = upcDetail.ProductLineDescription;
                        overviewDescription.Syndigo.SizeDescription = upcDetail.ExtendedSizeDescription;
 
                        if (string.IsNullOrWhiteSpace(overviewDescription.Syndigo.UsageDirections))
                        {
                            overviewDescription.Syndigo.UsageDirections = upcDetail.UsageDirectionsDescription;
                        }
 
                        if (string.IsNullOrWhiteSpace(overviewDescription.Syndigo.ProductDescription))
                        {
                            overviewDescription.Syndigo.ProductDescription = upcDetail.RomanceCopyDescription;
                        }
                    }
                }
            }
 
            private async Task ValidateUniqueVersionAsync(int itemCode, List<string> platformVersionIds, List<int> storeNumbers, int? excludeChangeSetId, CancellationToken cancellationToken)
            {
                // ScopeId is always the ItemCode (as string)
                var scopeId = itemCode.ToString();
 
                // Check staging ChangeSet records
                var existingChangeSets = await _changeSetRepository.GetByScopeAsync("ProductOffering", scopeId, cancellationToken);
                var activeChangeSets = existingChangeSets.Where(cs => cs.Status != "Published" && cs.Status != "Deleted" && cs.Id != excludeChangeSetId);
                if (activeChangeSets.Any())
                {
                    throw new InvalidOperationException($"An in-progress version already exists for Item {itemCode} with the same platform/store combination.");
                }
            }
        }
    }
 
 
 
 