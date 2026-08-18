using System.Diagnostics.CodeAnalysis;
using System.Text.Json.Serialization;
 
namespace IdmToolkit.Domain.Models.ProductOfferingSnapshots
{
    /// <summary>
    /// Snapshot model for Modifier Mapping tab in Product Offering Version editor.
    /// Serialized as JSON in ChangeTarget.ProposedSnapshot for ChangeTargetType = "ModifierMapping".
    /// </summary>
    [ExcludeFromCodeCoverage]
    public class ModifierMappingSnapshot
    {
        /// <summary>
        /// List of modifier group mappings with their associated modifiers.
        /// </summary>
        public List<ModifierGroupMapping> ModifierGroupMappings { get; set; } = [];
    }
 
    /// <summary>
    /// Represents a modifier group assigned to a product offering.
    /// </summary>
    [ExcludeFromCodeCoverage]
    public class ModifierGroupMapping
    {
        public int ModifierGroupId { get; set; }
        public string? ModifierGroupName { get; set; }
        public int? DisplaySequence { get; set; }
        public int? PrintSequence { get; set; }
        public bool EnablePortions { get; set; }
        public List<ModifierMapping> Modifiers { get; set; } = [];
    }
 
    /// <summary>
    /// Represents a modifier assigned within a modifier group.
    /// </summary>
    [ExcludeFromCodeCoverage]
    public class ModifierMapping
    {
        public int ModifierId { get; set; }
        public string? ModifierName { get; set; }
        public int? DisplaySequence { get; set; }
        public int? PrintSequence { get; set; }
        public bool IsDefaultModifier { get; set; }

        /// <summary>
        /// Review-only attributes are intentionally not serialized with ProposedSnapshot.
        /// They should be hydrated at read time from the attribute source.
        /// </summary>
        [JsonIgnore]
        public ModifierReviewAttributes ReviewAttributes { get; set; } = new();
    }

    [ExcludeFromCodeCoverage]
    public class ModifierReviewAttributes
    {
        public string? MobileImageUrl { get; set; }
        public string? WebImageUrl { get; set; }
    }
}